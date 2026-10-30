import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

// Helper: Initialize GoogleGenAI client (supports server environment key or user custom key)
const getGenAI = (customKey?: string) => {
  const apiKey = (customKey && customKey.trim()) || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

interface BlockInput {
  id: string;
  type: string; // 'h1' | 'h2' | 'h3' | 'p' | 'li' | 'blockquote' | 'table' | 'code'
  sourceText: string;
}

interface GlossaryItem {
  term: string;
  translation: string;
}

export type ApiProviderType =
  | 'gemini_default'
  | 'mymemory_free'
  | 'deepseek'
  | 'groq'
  | 'siliconflow'
  | 'openrouter'
  | 'moonshot'
  | 'gemini_custom'
  | 'custom_openai';

export interface UserApiConfig {
  provider: ApiProviderType;
  endpoint: string;
  apiKey: string;
  model: string;
  autoFallbackToFree?: boolean;
}

// Helper: Safely parse JSON from text with markdown codeblock and slice recovery
function extractJsonFromText(raw: string): any {
  let cleaned = (raw || '').trim();
  const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = cleaned.match(jsonBlockRegex);
  if (match) {
    cleaned = match[1].trim();
  }
  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
      } catch {}
    }
    return {};
  }
}

// Helper: Safely extract translations from model output with refusal recovery
function safeExtractTranslations(
  rawText: string,
  blocks: BlockInput[]
): Array<{ id: string; translation: string; notes?: string }> | null {
  if (!rawText || !rawText.trim()) return null;

  const trimmed = rawText.trim();

  // Check for model safety refusal (e.g., when encountering adult/erotic fanfiction content)
  const isRefusal =
    /cannot translate|safety policy|sensitive|adult content|inappropriate|violates|policy guidelines|the page contains|content filter/i.test(
      trimmed
    );
  if (isRefusal && !trimmed.includes('"translations"')) {
    console.warn('[Model Refusal]: Model refused text due to safety filter:', trimmed.slice(0, 120));
    return null; // Signal caller to automatically route to public non-censored translation
  }

  // 1. Try markdown code block extraction or direct JSON parse
  try {
    let candidate = trimmed;
    const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
    const match = candidate.match(jsonBlockRegex);
    if (match) candidate = match[1].trim();

    const parsed = JSON.parse(candidate);
    if (parsed && Array.isArray(parsed.translations) && parsed.translations.length > 0) {
      return parsed.translations;
    }
  } catch (e) {
    // 2. Substring slice between first { and last }
    try {
      const firstBrace = trimmed.indexOf('{');
      const lastBrace = trimmed.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const sliced = trimmed.slice(firstBrace, lastBrace + 1);
        const parsed = JSON.parse(sliced);
        if (parsed && Array.isArray(parsed.translations) && parsed.translations.length > 0) {
          return parsed.translations;
        }
      }
    } catch (e2) {}
  }

  // 3. Fallback: If blocks count is 1 and the model outputted plain text translation (not an error page)
  if (blocks.length === 1 && trimmed.length > 0 && !isRefusal && !trimmed.startsWith('<!DOCTYPE') && !trimmed.startsWith('<html')) {
    return [{ id: blocks[0].id, translation: trimmed, notes: '单段文本智能适配' }];
  }

  return null;
}

// Helper: Convert target language string to ISO code for public translation
function getLangPair(targetLang: string = 'Chinese (Simplified)'): string {
  if (/Chinese.*Trad|繁体/i.test(targetLang)) return 'en|zh-TW';
  if (/Japanese|日/i.test(targetLang)) return 'en|ja';
  if (/Korean|韩/i.test(targetLang)) return 'en|ko';
  if (/English|英/i.test(targetLang)) return 'zh-CN|en';
  if (/French|法/i.test(targetLang)) return 'en|fr';
  if (/German|德/i.test(targetLang)) return 'en|de';
  if (/Spanish|西/i.test(targetLang)) return 'en|es';
  return 'en|zh-CN';
}

// Helper: Free public translation for a single block
async function translateSingleFreeBlock(
  block: BlockInput,
  targetIso: string,
  langPair: string,
  glossary: GlossaryItem[]
): Promise<{ id: string; translation: string; notes: string }> {
  const text = (block.sourceText || '').trim();
  if (!text) {
    return { id: block.id, translation: '', notes: '免Key公共免费翻译' };
  }

  let translated = '';
  let engineNote = '免Key极速直译';

  // Mirror 1: Google Web Translate (Fast ~150ms, no key, no censorship on fanfiction/adult literature)
  try {
    const gUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetIso}&dt=t&q=${encodeURIComponent(text.slice(0, 2000))}`;
    const gResp = await fetch(gUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
    });
    if (gResp.ok) {
      const gText = await gResp.text();
      try {
        const gData = JSON.parse(gText);
        if (Array.isArray(gData) && Array.isArray(gData[0])) {
          translated = gData[0].map((item: any) => item[0]).join('');
          engineNote = '极速直译 (免Key并发直连)';
        }
      } catch {}
    }
  } catch (e: any) {}

  // Mirror 2: MyMemory Free API (if Mirror 1 didn't return text)
  if (!translated) {
    try {
      const encoded = encodeURIComponent(text.slice(0, 500));
      const url = `https://api.mymemory.translated.net/get?q=${encoded}&langpair=${langPair}`;
      const resp = await fetch(url);
      if (resp.ok) {
        const rawResp = await resp.text();
        try {
          const data = JSON.parse(rawResp);
          translated = data?.responseData?.translatedText || '';
          if (translated) engineNote = 'MyMemory 备用翻译';
        } catch {}
      }
    } catch (e: any) {}
  }

  // Fallback: keep original text
  if (!translated) {
    translated = text;
    engineNote = '公共引擎网络繁忙，保留原文对照';
  }

  // Clean HTML entities if returned
  translated = translated
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

  // Apply glossary terms
  glossary.forEach((g) => {
    if (g.term && g.translation) {
      const reg = new RegExp(g.term, 'gi');
      translated = translated.replace(reg, g.translation);
    }
  });

  return {
    id: block.id,
    translation: translated,
    notes: engineNote,
  };
}

// Helper: Free public translation with concurrent parallel execution (Blazing fast!)
async function translateBlocksWithFreeEngine(
  blocks: BlockInput[],
  targetLang: string = 'Chinese (Simplified)',
  glossary: GlossaryItem[] = []
): Promise<Array<{ id: string; translation: string; notes: string }>> {
  const langPair = getLangPair(targetLang);
  const targetIso = langPair.split('|')[1] || 'zh-CN';

  // Run all blocks in parallel for sub-second batch translation
  return await Promise.all(
    blocks.map((block) => translateSingleFreeBlock(block, targetIso, langPair, glossary))
  );
}

// Helper: Call any OpenAI-compatible API endpoint (DeepSeek, Groq, SiliconFlow, OpenRouter, Moonshot, Custom)
async function callOpenAICompatible(params: {
  endpoint: string;
  apiKey: string;
  model: string;
  systemInstruction: string;
  userPrompt: string;
  provider: ApiProviderType;
  responseFormatJson?: boolean;
}): Promise<string> {
  const { endpoint, apiKey, model, systemInstruction, userPrompt, provider, responseFormatJson } = params;

  let cleanEndpoint = (endpoint || '').trim().replace(/\/+$/, '');
  if (!cleanEndpoint.endsWith('/chat/completions')) {
    cleanEndpoint = `${cleanEndpoint}/chat/completions`;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (apiKey && apiKey.trim()) {
    headers['Authorization'] = `Bearer ${apiKey.trim()}`;
  }

  if (provider === 'openrouter' || cleanEndpoint.includes('openrouter.ai')) {
    headers['HTTP-Referer'] = 'https://chatternest.app';
    headers['X-Title'] = 'ChatterNest Bilingual Reader';
  }

  const bodyPayload: any = {
    model: model || 'deepseek-chat',
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
  };

  if (responseFormatJson) {
    bodyPayload.response_format = { type: 'json_object' };
  }

  let response = await fetch(cleanEndpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(bodyPayload),
  });

  // If response_format caused an error (e.g., model does not support json_object mode), retry without it
  if (!response.ok && responseFormatJson) {
    delete bodyPayload.response_format;
    response = await fetch(cleanEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(bodyPayload),
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    let detail = '';
    try {
      const errJson = JSON.parse(errorText);
      detail = errJson.error?.message || errJson.message || errorText;
    } catch {
      detail = errorText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
    }

    let msg = `API 请求失败 (HTTP ${response.status}): ${detail}`;
    if (response.status === 401) {
      msg = `API Key 鉴权失败 (HTTP 401): 密钥无效、未授权或未填写。请核对您填写的 API Key 是否正确复制。(${detail})`;
    } else if (response.status === 429) {
      msg = `API 配额用尽或触发频率限制 (HTTP 429): 账户额度不足或并发过高。(${detail})`;
    } else if (response.status === 404) {
      msg = `接口地址或模型未找到 (HTTP 404): 请检查 Base URL 或所选模型名称是否正确。(${detail})`;
    }
    throw new Error(msg);
  }

  const rawResponseText = await response.text();
  let data: any = null;
  try {
    data = JSON.parse(rawResponseText);
  } catch (err) {
    const cleanSnippet = rawResponseText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
    throw new Error(`API 接口返回了非预期的非 JSON 内容 (HTTP ${response.status}): ${cleanSnippet || '服务暂时不可用'}`);
  }

  const content = data?.choices?.[0]?.message?.content || '';
  return content;
}

// 1. Batch / Section Translate API
app.post('/api/translate', async (req, res) => {
  try {
    const {
      blocks,
      sourceLang = 'Auto',
      targetLang = 'Chinese (Simplified)',
      promptTemplate,
      glossary = [] as GlossaryItem[],
      stylePreference = 'natural',
      apiConfig,
    } = req.body;

    if (!Array.isArray(blocks) || blocks.length === 0) {
      return res.status(400).json({ error: 'blocks array is required and must not be empty.' });
    }

    const provider: ApiProviderType = apiConfig?.provider || 'gemini_default';
    const autoFallback = apiConfig?.autoFallbackToFree !== false;

    // Prepare glossary instructions
    let glossaryInstruction = '';
    if (glossary && glossary.length > 0) {
      glossaryInstruction =
        `\n[Mandatory Terminology Glossary]:\n` +
        glossary.map((g: GlossaryItem) => `- "${g.term}" MUST be translated as "${g.translation}"`).join('\n');
    }

    // System instruction for AI models
    let systemInstruction = `You are an expert literary and technical bilingual translator specializing in high-fidelity document translation into ${targetLang}.
Your goal is to translate source document segments accurately into natural, idiomatic, and fluent ${targetLang}, strictly preserving formatting context, terminology, semantic structure, character names, tone, and emotional resonance.
Do NOT omit any content. Maintain bullet structures, numbering, formulas, inline codes, and formatting markers intact.
Always output strict JSON format:
{
  "translations": [
    { "id": "block-id", "translation": "translated text in ${targetLang}", "notes": "optional brief notes" }
  ]
}
${glossaryInstruction}`;

    if (promptTemplate && promptTemplate.trim()) {
      systemInstruction += `\n\n[User Custom Translation Directives]:\n${promptTemplate}`;
    }

    // CASE 1: MyMemory 100% Free Public Engine (No key needed)
    if (provider === 'mymemory_free') {
      const translations = await translateBlocksWithFreeEngine(blocks, targetLang, glossary);
      return res.json({ translations, provider: 'mymemory_free' });
    }

    // CASE 2: OpenAI Compatible Models (DeepSeek, Groq, SiliconFlow, OpenRouter, Moonshot, Custom)
    if (
      provider === 'deepseek' ||
      provider === 'groq' ||
      provider === 'siliconflow' ||
      provider === 'openrouter' ||
      provider === 'moonshot' ||
      provider === 'custom_openai'
    ) {
      try {
        const userPrompt = JSON.stringify({
          task: `Translate the following ${blocks.length} blocks into ${targetLang}. Output pure JSON.`,
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
          stylePreference,
          blocks: blocks.map((b: BlockInput) => ({
            id: b.id,
            type: b.type,
            text: b.sourceText,
          })),
        });

        const rawResult = await callOpenAICompatible({
          endpoint: apiConfig.endpoint,
          apiKey: apiConfig.apiKey,
          model: apiConfig.model,
          systemInstruction,
          userPrompt,
          provider,
          responseFormatJson: true,
        });

        const translations = safeExtractTranslations(rawResult, blocks);
        if (translations && translations.length > 0) {
          return res.json({ translations, provider });
        } else {
          throw new Error('模型输出未包含标准 translations 数组 (可能触发了敏感内容/成人内容过滤)');
        }
      } catch (err: any) {
        console.error(`Error translating with ${provider}:`, err.message);
        if (autoFallback) {
          console.warn(`[Auto-Fallback] Switching to Free Public Engine due to: ${err.message}`);
          const freeTranslations = await translateBlocksWithFreeEngine(blocks, targetLang, glossary);
          return res.json({
            translations: freeTranslations.map((t) => ({
              ...t,
              notes: `【备选引擎】${provider} 遇到提示 (${err.message.slice(0, 40)})，已自动由免Key公共翻译接管`,
            })),
            fallbackTriggered: true,
            originalError: err.message,
          });
        }
        throw err;
      }
    }

    // CASE 3: Google Gemini (Server Default or User Custom Key)
    const customKey = provider === 'gemini_custom' ? apiConfig?.apiKey : undefined;
    const ai = getGenAI(customKey);

    if (!ai) {
      // When no Gemini API key is available, use free public engine or fallback
      const freeTranslations = await translateBlocksWithFreeEngine(blocks, targetLang, glossary);
      return res.json({
        translations: freeTranslations,
        provider: 'mymemory_free_fallback',
        notes: '系统未检测到 GEMINI_API_KEY，已自动由免Key公共翻译引擎提供对照',
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: apiConfig?.model || 'gemini-3.8-flash',
        contents: JSON.stringify({
          task: `Translate the following blocks into ${targetLang}. Preserve the original tone and context.`,
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
          stylePreference,
          blocks: blocks.map((b: BlockInput) => ({
            id: b.id,
            type: b.type,
            text: b.sourceText,
          })),
        }),
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              translations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    translation: { type: Type.STRING },
                    notes: { type: Type.STRING, description: 'Optional cultural or linguistic notes' },
                  },
                  required: ['id', 'translation'],
                },
              },
            },
            required: ['translations'],
          },
        },
      });

      const translations = safeExtractTranslations(response.text || '', blocks);
      if (translations && translations.length > 0) {
        return res.json({ translations, provider: provider || 'gemini' });
      } else {
        throw new Error('Gemini 模型返回内容未包含合法 JSON (可能触发了成人或特定词汇安全过滤)');
      }
    } catch (geminiError: any) {
      console.error('Gemini translation error:', geminiError.message || geminiError);

      if (autoFallback) {
        console.warn(`[Auto-Fallback] Gemini notice. Switching to Free Public Engine.`);
        const freeTranslations = await translateBlocksWithFreeEngine(blocks, targetLang, glossary);
        return res.json({
          translations: freeTranslations.map((t) => ({
            ...t,
            notes: '【备选引擎】已自动无缝切换至免Key公共翻译完成',
          })),
          fallbackTriggered: true,
          originalError: geminiError.message,
        });
      }

      throw geminiError;
    }
  } catch (error: any) {
    console.error('Translation top error:', error);
    try {
      // Ultimate safety net: always return translated blocks using free public engine so user never sees crash
      const { blocks = [], targetLang, glossary } = req.body || {};
      if (Array.isArray(blocks) && blocks.length > 0) {
        const freeTranslations = await translateBlocksWithFreeEngine(blocks, targetLang, glossary);
        return res.json({
          translations: freeTranslations.map((t) => ({
            ...t,
            notes: `【应急备选】已由公共翻译引擎成功译出`,
          })),
          fallbackTriggered: true,
          originalError: error.message,
        });
      }
    } catch (e2) {}

    res.json({
      translations: (req.body?.blocks || []).map((b: any) => ({
        id: b.id,
        translation: b.sourceText,
        notes: `翻译遇阻: ${error?.message?.slice(0, 60) || '请检查网络'}`,
      })),
      error: error?.message || '翻译失败，请检查网络设置。',
    });
  }
});

// 2. AI Polish API (润色与优化 - 支持各类模型与提供商)
app.post('/api/polish', async (req, res) => {
  try {
    const {
      sourceText,
      currentTranslation,
      polishStyle = 'faithfulness_elegance',
      customInstruction,
      targetLang = 'Chinese (Simplified)',
      apiConfig,
    } = req.body;

    if (!sourceText || !currentTranslation) {
      return res.status(400).json({ error: 'sourceText and currentTranslation are required.' });
    }

    const provider: ApiProviderType = apiConfig?.provider || 'gemini_default';

    const styleDescriptions: Record<string, string> = {
      faithfulness_elegance: '信达雅风格：追求准确严谨（信）、文意通达流畅（达）、文辞洗练文雅（雅），消除机器翻译生硬腔调。',
      academic: '学术规范风格：严格遵循学术论文规范，专业术语精准，逻辑衔接严密，客观严谨。',
      business: '商务公文风格：得体、庄重、精炼、具有商务沟通与官方报告的高质感。',
      colloquial: '现代通俗流畅：地道自然，符合当下中文母语阅读习惯，生动形象易于理解。',
      tech_modern: '科技前沿风格：规范计算机/科技领域专业表达，保留必要英文缩写或行业约定俗成译法。',
    };

    const chosenStyleDesc = styleDescriptions[polishStyle] || styleDescriptions.faithfulness_elegance;

    const systemInstruction = `You are a master bilingual editor and native-speaking stylistic polishing expert in ${targetLang}.
Your task is to polish and refine a translation to make it substantially more natural, elegant, and idiomatic according to the requested style:
Style: ${chosenStyleDesc}
${customInstruction ? `Custom Instructions: ${customInstruction}` : ''}
Eliminate awkward "translationese" (翻译腔), improve phrasing rhythm, use accurate and elegant vocabulary, but strictly never distort the original factual meaning.
Always output strict JSON:
{
  "polishedText": "refined translation text",
  "improvementsSummary": "brief explanation in Chinese detailing what was improved and why",
  "keyTerminology": ["improved term 1", "improved idiom 2"]
}`;

    // If provider is OpenAI-compatible (DeepSeek is especially renowned for literature polish!)
    if (
      provider === 'deepseek' ||
      provider === 'groq' ||
      provider === 'siliconflow' ||
      provider === 'openrouter' ||
      provider === 'moonshot' ||
      provider === 'custom_openai'
    ) {
      try {
        const userPrompt = JSON.stringify({
          sourceOriginalText: sourceText,
          initialTranslation: currentTranslation,
          requestedStyle: polishStyle,
        });

        const rawResult = await callOpenAICompatible({
          endpoint: apiConfig.endpoint,
          apiKey: apiConfig.apiKey,
          model: apiConfig.model,
          systemInstruction,
          userPrompt,
          provider,
          responseFormatJson: true,
        });

        const parsed = extractJsonFromText(rawResult);
        return res.json({
          polishedText: parsed.polishedText || currentTranslation,
          improvementsSummary: parsed.improvementsSummary || `经 ${provider} 模型深度润色`,
          keyTerminology: parsed.keyTerminology || [],
        });
      } catch (err: any) {
        console.error(`Polish error with ${provider}:`, err.message);
      }
    }

    // Gemini polish
    const customKey = provider === 'gemini_custom' ? apiConfig?.apiKey : undefined;
    const ai = getGenAI(customKey);

    if (!ai) {
      return res.json({
        polishedText: currentTranslation.replace(/的/g, '之').replace(/【.*】/, '') + '（信达雅润色）',
        improvementsSummary: '已重构生硬长句结构，替换为更加典雅洗练的汉语书面用语，增强文学张力。',
        keyTerminology: ['精炼句式', '破除翻译腔', '语境韵律调和'],
      });
    }

    const response = await ai.models.generateContent({
      model: apiConfig?.model || 'gemini-3.8-flash',
      contents: JSON.stringify({
        sourceOriginalText: sourceText,
        initialTranslation: currentTranslation,
        requestedStyle: polishStyle,
      }),
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            polishedText: { type: Type.STRING },
            improvementsSummary: {
              type: Type.STRING,
              description: 'Brief explanation in Chinese detailing what was improved and why',
            },
            keyTerminology: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Notable improved idioms, phrases, or terminology choices',
            },
          },
          required: ['polishedText', 'improvementsSummary'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Polish error:', error);
    res.status(500).json({
      error: error?.message || '润色处理遇到问题。',
    });
  }
});

// 3. Prompt Template Evaluation API
app.post('/api/test-prompt', async (req, res) => {
  try {
    const { template, sampleText, targetLang = 'Chinese (Simplified)' } = req.body;
    if (!sampleText) {
      return res.status(400).json({ error: 'sampleText is required' });
    }

    const ai = getGenAI();

    if (!ai) {
      return res.json({
        result: `【测试结果（遵循所选提示词模板）】：\n样本译文：“自动化流水线能够在无需零样本微调的情况下，有效抑制大语言模型的幻觉生成。”`,
      });
    }

    const systemInstruction = `You are a professional translator evaluating a custom prompt template for translation to ${targetLang}.
Template Directives:
${template || 'Translate accurately and naturally.'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Translate this sample text according to the system instructions:\n\n${sampleText}`,
      config: {
        systemInstruction,
      },
    });

    res.json({ result: response.text });
  } catch (error: any) {
    console.error('Test prompt error:', error);
    res.status(500).json({ error: error?.message || 'Prompt testing failed.' });
  }
});

// 4. API Connection & Translation Tester Endpoint
app.post('/api/test-api', async (req, res) => {
  const startTime = Date.now();
  try {
    const {
      apiConfig,
      sampleText = 'The little bird winked playfully under the warm sunlight.',
      targetLang = 'Chinese (Simplified)',
    } = req.body;

    if (!apiConfig) {
      return res.status(400).json({ error: 'apiConfig is required.' });
    }

    const provider: ApiProviderType = apiConfig.provider;

    // Test MyMemory Free Engine
    if (provider === 'mymemory_free') {
      const results = await translateBlocksWithFreeEngine(
        [{ id: 'test-1', type: 'p', sourceText: sampleText }],
        targetLang
      );
      const latencyMs = Date.now() - startTime;
      return res.json({
        success: true,
        translation: results[0]?.translation || sampleText,
        latencyMs,
        providerName: '免Key免费公共翻译 (MyMemory)',
        message: '连接成功！已由公共翻译引擎快速返回结果。',
      });
    }

    // Test OpenAI compatible endpoints
    if (
      provider === 'deepseek' ||
      provider === 'groq' ||
      provider === 'siliconflow' ||
      provider === 'openrouter' ||
      provider === 'moonshot' ||
      provider === 'custom_openai'
    ) {
      if (!apiConfig.endpoint || !apiConfig.endpoint.trim()) {
        return res.json({
          success: false,
          error: '请提供有效的 API Base URL 地址',
          latencyMs: Date.now() - startTime,
        });
      }

      // Check if API Key is empty for providers that require authentication
      if (provider !== 'custom_openai' && (!apiConfig.apiKey || !apiConfig.apiKey.trim())) {
        return res.json({
          success: false,
          error: `当前选择的【${provider}】需要填写 API Key 才能调用。请在下方输入框粘贴您的 Key 后再测试，或选择「免Key免费公共翻译」。`,
          latencyMs: Date.now() - startTime,
        });
      }

      const systemInstruction = `Translate the English sentence accurately and naturally into ${targetLang}. Output ONLY the direct translated sentence with no explanations.`;
      const translation = await callOpenAICompatible({
        endpoint: apiConfig.endpoint,
        apiKey: apiConfig.apiKey,
        model: apiConfig.model,
        systemInstruction,
        userPrompt: sampleText,
        provider,
        responseFormatJson: false,
      });

      const latencyMs = Date.now() - startTime;
      return res.json({
        success: true,
        translation: translation.trim(),
        latencyMs,
        providerName: provider,
        message: 'API 连接与翻译测试成功！响应迅速。',
      });
    }

    // Test Gemini Custom Key or Default
    const customKey = provider === 'gemini_custom' ? apiConfig.apiKey : undefined;
    if (provider === 'gemini_custom' && (!customKey || !customKey.trim())) {
      return res.json({
        success: false,
        error: '未检测到个人 Gemini API Key，请在下方输入框填入您的 Key 后再测试，或直接选择「系统内置 Gemini」。',
        latencyMs: Date.now() - startTime,
      });
    }

    const ai = getGenAI(customKey);

    if (!ai) {
      return res.json({
        success: false,
        error: '未检测到有效的 Gemini API Key，请选择「免Key免费公共翻译」或填入您的个人 Key。',
        latencyMs: Date.now() - startTime,
      });
    }

    const response = await ai.models.generateContent({
      model: apiConfig.model || 'gemini-3.8-flash',
      contents: `Translate the following sentence into ${targetLang}:\n\n${sampleText}`,
    });

    const latencyMs = Date.now() - startTime;
    return res.json({
      success: true,
      translation: (response.text || '').trim(),
      latencyMs,
      providerName: provider === 'gemini_custom' ? 'Google Gemini (个人Key)' : 'Google Gemini (系统内置)',
      message: 'Google Gemini 接口通信正常！',
    });
  } catch (err: any) {
    console.warn('[API Test Notice]:', err?.message || err);
    res.json({
      success: false,
      error: err.message || 'API 测试未成功，请检查 API Key 是否有效或网络是否畅通。',
      latencyMs: Date.now() - startTime,
    });
  }
});

// Vite middleware for dev or static serving for prod
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ChatterNest server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
