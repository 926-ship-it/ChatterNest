import { ApiProviderPreset, UserApiConfig } from '../types/document';

export const API_PROVIDER_PRESETS: ApiProviderPreset[] = [
  {
    id: 'gemini_default',
    name: 'Google Gemini (系统内置)',
    badge: '官方默认',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    description: '开箱即用，由 Google Gemini 3.8 Flash 提供快速高质量双语伴读与专业润色。',
    requiresKey: false,
    isFree: true,
    defaultEndpoint: 'https://generativelanguage.googleapis.com',
    defaultModel: 'gemini-3.8-flash',
    availableModels: ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'],
    keyPlaceholder: '',
    keyHelpText: '系统已内置云端服务，无需额外填写配置',
  },
  {
    id: 'mymemory_free',
    name: '免Key免费公共翻译 (MyMemory / 公共网络)',
    badge: '100%免费·免Key',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    description: '无需任何 API Key，零门槛免费使用！基于国际公共翻译记忆引擎，适合当大模型配额耗尽时的备选。',
    requiresKey: false,
    isFree: true,
    defaultEndpoint: 'https://api.mymemory.translated.net',
    defaultModel: 'public-free-engine',
    availableModels: ['public-free-engine'],
    keyPlaceholder: '',
    keyHelpText: '无需任何 API Key，点选即可立即生效',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek (深度求索)',
    badge: '文学同人首选',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    description: '公认目前中文语境文采极佳、去翻译腔效果绝伦的大模型，价格极度实惠且注册赠送体验额度。',
    requiresKey: true,
    isFree: false,
    defaultEndpoint: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    availableModels: ['deepseek-chat', 'deepseek-reasoner'],
    keyPlaceholder: 'sk-... (填入 DeepSeek API Key)',
    keyHelpUrl: 'https://platform.deepseek.com/api_keys',
    keyHelpText: '前往 DeepSeek 开放平台获取 API Key',
  },
  {
    id: 'groq',
    name: 'Groq (极速免费层 AI)',
    badge: '高额免费·秒速生成',
    badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    description: '基于 LPU 超高速芯片，官方提供慷慨的永久免费额度 (Free Tier)，每秒数百词极速并发翻译。',
    requiresKey: true,
    isFree: true,
    defaultEndpoint: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    availableModels: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
    keyPlaceholder: 'gsk_... (填入 Groq API Key)',
    keyHelpUrl: 'https://console.groq.com/keys',
    keyHelpText: '前往 Groq 控制台免费创建 API Key',
  },
  {
    id: 'siliconflow',
    name: 'SiliconFlow (硅基流动)',
    badge: '国内高速·含免费模型',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    description: '国内高速直连无需科学上网，聚合 DeepSeek-V3、Qwen2.5 顶级模型，多款模型永久免费。',
    requiresKey: true,
    isFree: true,
    defaultEndpoint: 'https://api.siliconflow.cn/v1',
    defaultModel: 'deepseek-ai/DeepSeek-V3',
    availableModels: [
      'deepseek-ai/DeepSeek-V3',
      'Qwen/Qwen2.5-72B-Instruct',
      'Qwen/Qwen2.5-32B-Instruct',
      'Qwen/Qwen2.5-7B-Instruct',
      'THUDM/glm-4-9b-chat',
    ],
    keyPlaceholder: 'sk-... (填入硅基流动 API Key)',
    keyHelpUrl: 'https://cloud.siliconflow.cn/account/ak',
    keyHelpText: '前往硅基流动控制台获取 Key (赠送额度)',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter (全球模型聚合)',
    badge: '含专属 :free 免费模型',
    badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    description: '一处 Key 聚合数百款全球模型，包含专属的永久免费模型池 (以 :free 结尾的模型零费用)。',
    requiresKey: true,
    isFree: true,
    defaultEndpoint: 'https://openrouter.ai/api/v1',
    defaultModel: 'meta-llama/llama-3.3-70b-instruct:free',
    availableModels: [
      'meta-llama/llama-3.3-70b-instruct:free',
      'google/gemini-2.0-flash-exp:free',
      'deepseek/deepseek-r1:free',
      'deepseek/deepseek-chat',
    ],
    keyPlaceholder: 'sk-or-v1-... (填入 OpenRouter API Key)',
    keyHelpUrl: 'https://openrouter.ai/keys',
    keyHelpText: '前往 OpenRouter 创建 API Key',
  },
  {
    id: 'gemini_custom',
    name: 'Google Gemini (个人自备免费Key)',
    badge: '独立专属额度',
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    description: '自备在 Google AI Studio 申请的个人专属 Key，独享每天 1500+ 次免费请求配额，不与公共额度冲突。',
    requiresKey: true,
    isFree: true,
    defaultEndpoint: 'https://generativelanguage.googleapis.com',
    defaultModel: 'gemini-2.5-flash',
    availableModels: ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-3.8-flash'],
    keyPlaceholder: 'AIzaSy... (填入 Google AI Studio API Key)',
    keyHelpUrl: 'https://aistudio.google.com/app/apikey',
    keyHelpText: '前往 Google AI Studio 免费一键获取个人专属 Key',
  },
  {
    id: 'moonshot',
    name: 'Moonshot AI / Kimi (月之暗面)',
    badge: '长文本见长',
    badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    description: 'Kimi 官方大模型接口，长文本理解能力强，中文行文温润自然。',
    requiresKey: true,
    isFree: false,
    defaultEndpoint: 'https://api.moonshot.cn/v1',
    defaultModel: 'moonshot-v1-8k',
    availableModels: ['moonshot-v1-8k', 'moonshot-v1-32k'],
    keyPlaceholder: 'sk-... (填入 Moonshot API Key)',
    keyHelpUrl: 'https://platform.moonshot.cn/console/api-keys',
    keyHelpText: '前往 Moonshot 开放平台获取 API Key',
  },
  {
    id: 'custom_openai',
    name: '自定义 OpenAI 兼容接口',
    badge: '支持自建/中转/Ollama',
    badgeColor: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700',
    description: '支持任何兼容 OpenAI 规范的 API 服务地址、OneAPI / NewAPI 中转站或本地运行的 Ollama / vLLM。',
    requiresKey: true,
    isFree: false,
    defaultEndpoint: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    availableModels: ['gpt-4o-mini', 'gpt-4o', 'qwen-max', 'claude-3-5-sonnet'],
    keyPlaceholder: 'sk-... (中转站 Key 或本地无需密码可填任意字符)',
    keyHelpText: '自定义 Base URL、模型名称和 API Key',
  },
];

export const DEFAULT_USER_API_CONFIG: UserApiConfig = {
  provider: 'gemini_default',
  endpoint: 'https://generativelanguage.googleapis.com',
  apiKey: '',
  model: 'gemini-3.8-flash',
  autoFallbackToFree: true, // Auto fallback to free translation when primary API is exhausted
};

export const API_STORAGE_KEY = 'chatternest_api_config_v1';

export function loadApiConfigFromStorage(): UserApiConfig {
  try {
    const raw = localStorage.getItem(API_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.provider) {
        return {
          ...DEFAULT_USER_API_CONFIG,
          ...parsed,
        };
      }
    }
  } catch (e) {
    console.error('Failed to load api config from storage:', e);
  }
  return DEFAULT_USER_API_CONFIG;
}

export function saveApiConfigToStorage(config: UserApiConfig): void {
  try {
    localStorage.setItem(API_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save api config to storage:', e);
  }
}
