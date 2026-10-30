/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  DocumentBlock,
  DocumentMeta,
  ViewMode,
  TypographyConfig,
  ThemeConfig,
  PromptTemplate,
  GlossaryItem,
  PolishStyle,
  Bookmark as BookmarkType,
  BookshelfStory,
  UserApiConfig,
} from './types/document';
import { THEMES, DEFAULT_PROMPT_TEMPLATES, INITIAL_GLOSSARY, SAMPLE_DOCUMENTS } from './data/presets';
import { loadApiConfigFromStorage, saveApiConfigToStorage } from './data/apiPresets';
import { parseHTMLToBlocks, parseAO3Document } from './utils/importer';
import { loadBookshelfFromStorage, saveBookshelfToStorage } from './utils/bookshelfDefaults';
import { calculateStoryStats } from './utils/readingTime';
import { Navbar } from './components/Navbar';
import { BlockRow } from './components/BlockRow';
import { StyleModal } from './components/StyleModal';
import { PromptModal } from './components/PromptModal';
import { PolishModal } from './components/PolishModal';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { ExportModal } from './components/ExportModal';
import { ImportModal } from './components/ImportModal';
import { BookmarkDrawer } from './components/BookmarkDrawer';
import { BookshelfDrawer } from './components/BookshelfDrawer';
import { PrintContainer } from './components/PrintContainer';
import { Ao3HeaderCard } from './components/Ao3HeaderCard';
import { ReaderProgressBar } from './components/ReaderProgressBar';
import {
  Upload,
  Sparkles,
  RefreshCw,
  Sliders,
  Palette,
  Download,
  Columns,
  AlignJustify,
  FileCheck,
  CheckCircle2,
  FileText,
  Bookmark as BookmarkIcon,
  ChevronRight,
  Info,
  Heart,
  BookOpen,
  Library,
  Clock,
  Zap,
} from 'lucide-react';



export default function App() {
  // 1. Core Document State - Preload Public Domain Literature
  const initialSample = SAMPLE_DOCUMENTS[0];
  const [blocks, setBlocks] = useState<DocumentBlock[]>([]);
  const [meta, setMeta] = useState<DocumentMeta>({
    id: 'initial-sample-doc',
    title: initialSample.title,
    fileName: `${initialSample.id}.html`,
    fileType: 'html',
    sourceLang: 'English',
    targetLang: 'Chinese (Simplified)',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ao3Meta: initialSample.ao3Meta,
  });

  // 2. View Mode & Preferences (defaults to Classic Crimson Theme & Reading Serif)
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(THEMES[0]); // 绯红书斋
  const [typography, setTypography] = useState<TypographyConfig>({
    fontFamily: 'serif',
    fontSize: 16,
    lineHeight: 1.85,
    paragraphSpacing: 18,
    columnRatio: '50-50',
    highlightActive: true,
    sourceDimming: false,
    showBilingualNotes: true,
    keepEnglishNames: true, // Retain original English character names by default
  });

  // 3. Prompt & API Preferences
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate>(DEFAULT_PROMPT_TEMPLATES[0]);
  const [customTemplates, setCustomTemplates] = useState<PromptTemplate[]>([]);
  const [glossary, setGlossary] = useState<GlossaryItem[]>(INITIAL_GLOSSARY);
  const [apiConfig, setApiConfig] = useState<UserApiConfig>(() => loadApiConfigFromStorage());

  // Sync API config to localStorage
  useEffect(() => {
    saveApiConfigToStorage(apiConfig);
  }, [apiConfig]);

  // 4. Modal & Drawer States
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isStyleOpen, setIsStyleOpen] = useState(false);
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [isApiSettingsOpen, setIsApiSettingsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isPolishOpen, setIsPolishOpen] = useState(false);
  const [isBookmarkDrawerOpen, setIsBookmarkDrawerOpen] = useState(false);
  const [isBookshelfOpen, setIsBookshelfOpen] = useState(false);
  const [targetBlockForPolish, setTargetBlockForPolish] = useState<DocumentBlock | null>(null);

  // 5. Bookshelf State (100% saved in user's browser local storage)
  const [bookshelf, setBookshelf] = useState<BookshelfStory[]>(() => loadBookshelfFromStorage());

  // 6. Bookmarks State (persisted in localStorage)
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>(() => {
    try {
      const saved = localStorage.getItem('chatternest_bookmarks_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });
  const [highlightedBlockId, setHighlightedBlockId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('chatternest_bookmarks_v1', JSON.stringify(bookmarks));
    } catch (e) {}
  }, [bookmarks]);

  // Sync bookshelf to localStorage
  useEffect(() => {
    saveBookshelfToStorage(bookshelf);
  }, [bookshelf]);

  // 7. Execution State
  const [isTranslating, setIsTranslating] = useState(false);
  const [isBatchPolishing, setIsBatchPolishing] = useState(false);

  // 8. Auto-Translate Stream State (伴读流式自动翻译)
  const [autoTranslateEnabled, setAutoTranslateEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('chatternest_auto_translate');
      return saved !== null ? saved === 'true' : true; // Default ON so reading is continuous
    } catch (e) {
      return true;
    }
  });
  const [autoTranslateNotice, setAutoTranslateNotice] = useState<string | null>(null);
  const isAutoLoopRunningRef = useRef(false);

  const toggleAutoTranslate = () => {
    setAutoTranslateEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('chatternest_auto_translate', String(next));
      } catch (e) {}
      return next;
    });
  };

  // Initialize workspace from the first story in bookshelf on mount
  useEffect(() => {
    if (bookshelf.length > 0) {
      const initialStory = bookshelf[0];
      setBlocks(initialStory.blocks);
      setMeta({
        id: initialStory.id,
        title: initialStory.title,
        fileName: initialStory.fileName,
        fileType: initialStory.fileType,
        sourceLang: initialStory.sourceLang || 'English',
        targetLang: initialStory.targetLang || 'Chinese (Simplified)',
        createdAt: initialStory.createdAt,
        updatedAt: initialStory.updatedAt,
        ao3Meta: initialStory.ao3Meta,
      });

      // Seed default sample bookmarks if none saved
      setBookmarks((prev) => {
        if (prev.length > 0) return prev;
        if (initialStory.bookmarks && initialStory.bookmarks.length > 0) {
          return initialStory.bookmarks;
        }
        if (initialStory.blocks.length > 8) {
          return [
            {
              id: `bm-${Date.now()}-1`,
              blockId: initialStory.blocks[3].id,
              blockIndex: 3,
              previewText: initialStory.blocks[3].targetText || initialStory.blocks[3].sourceText,
              sourcePreview: initialStory.blocks[3].sourceText,
              note: '唯美名场面：学生与红玫瑰的契约',
              createdAt: Date.now() - 3600000,
            },
            {
              id: `bm-${Date.now()}-2`,
              blockId: initialStory.blocks[8].id,
              blockIndex: 8,
              previewText: initialStory.blocks[8].targetText || initialStory.blocks[8].sourceText,
              sourcePreview: initialStory.blocks[8].sourceText,
              note: '王尔德经典金句：爱的真谛',
              createdAt: Date.now() - 1800000,
            },
          ];
        }
        return prev;
      });
    }
  }, []);


  // 6. Reading Progress Tracker based on viewport scroll position
  const [currentReadBlock, setCurrentReadBlock] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const blockElements = document.querySelectorAll('.print-bilingual-row');
      if (blockElements.length === 0) return;

      const scrollPosition = window.scrollY + 280;
      let activeIndex = 0;

      blockElements.forEach((el, idx) => {
        const top = (el as HTMLElement).offsetTop;
        if (scrollPosition >= top) {
          activeIndex = idx;
        }
      });

      setCurrentReadBlock(Math.min(blocks.length, Math.max(1, activeIndex + 1)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [blocks.length]);

  const handleJumpToUntranslated = () => {
    const untranslatedIdx = blocks.findIndex(
      (b) => !b.targetText || !b.targetText.trim() || b.targetText === b.sourceText
    );
    if (untranslatedIdx !== -1) {
      const blockElements = document.querySelectorAll('.print-bilingual-row');
      if (blockElements[untranslatedIdx]) {
        blockElements[untranslatedIdx].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Handler: Update a block's translation text
  const handleUpdateTargetText = (id: string, text: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, targetText: text } : b))
    );
  };

  // Helper to compile prompt directives including English names preference
  const getCompiledPromptTemplate = () => {
    let directive = selectedTemplate.systemDirective;
    if (typography.keepEnglishNames) {
      directive += `\n\n[Fanfiction Preference: Keep English Names]:\nKeep all character first names and nicknames in their original English form (e.g. John, Sherlock, Steve, Tony, Vael, Liam). Do NOT phonetically transliterate names into Chinese characters unless explicitly directed.`;
    }
    return directive;
  };

  // Safe helper to invoke /api/translate with text extraction and resilience
  const callApiTranslate = async (payload: any) => {
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        const cleanSnippet = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100);
        return {
          ok: false,
          error: `接口返回了非预期的页面内容 (${res.status || '502'}): ${cleanSnippet || '服务暂时繁忙'}`,
          translations: [],
        };
      }

      if (!res.ok) {
        return {
          ok: false,
          error: data?.error || `请求异常 (HTTP ${res.status})`,
          translations: data?.translations || [],
        };
      }

      return {
        ok: true,
        translations: data?.translations || [],
        fallbackTriggered: data?.fallbackTriggered,
        notes: data?.notes,
      };
    } catch (netErr: any) {
      return {
        ok: false,
        error: netErr?.message || '网络连接超时',
        translations: [],
      };
    }
  };

  // Handler: Translate a single block
  const handleTranslateSingle = async (block: DocumentBlock) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === block.id ? { ...b, isTranslating: true } : b))
    );

    try {
      const activeGlossary = glossary.filter((g) => g.enabled);
      const result = await callApiTranslate({
        blocks: [{ id: block.id, type: block.type, sourceText: block.sourceText }],
        sourceLang: meta.sourceLang,
        targetLang: meta.targetLang,
        promptTemplate: getCompiledPromptTemplate(),
        glossary: activeGlossary,
        stylePreference: selectedTemplate.stylePreference,
        apiConfig,
      });

      const item = result.translations?.[0];
      if (item && item.translation) {
        setBlocks((prev) =>
          prev.map((b) =>
            b.id === block.id
              ? {
                  ...b,
                  targetText: item.translation,
                  notes: item.notes,
                  isTranslating: false,
                }
              : b
          )
        );
        if (result.fallbackTriggered) {
          setAutoTranslateNotice('原模型出现提示，已自动通过免Key公共备选引擎译出本段');
        }
      } else {
        setBlocks((prev) =>
          prev.map((b) => (b.id === block.id ? { ...b, isTranslating: false } : b))
        );
        if (!result.ok) {
          setAutoTranslateNotice(`单段翻译提示: ${result.error || '未能成功获取译文'}`);
        }
      }
    } catch (err: any) {
      console.error('Single block translation error:', err);
      setBlocks((prev) =>
        prev.map((b) => (b.id === block.id ? { ...b, isTranslating: false } : b))
      );
      setAutoTranslateNotice(`单段翻译提示: ${err.message || '网络连接异常'}`);
    }
  };

  // Auto-Translate Stream Engine: Streams translation ahead of current reading position
  useEffect(() => {
    if (!autoTranslateEnabled || isTranslating || blocks.length === 0) {
      return;
    }

    const isUntranslated = (b: DocumentBlock) =>
      !b.targetText || !b.targetText.trim() || b.targetText === b.sourceText;

    // Prioritize blocks in/near viewport starting from current read block index
    const readIndex = Math.max(0, currentReadBlock - 1);
    const downstream = blocks.slice(readIndex).filter((b) => isUntranslated(b) && !b.isTranslating);
    const upstream = blocks.slice(0, readIndex).filter((b) => isUntranslated(b) && !b.isTranslating);

    const candidates = downstream.length > 0 ? downstream : upstream;
    if (candidates.length === 0) {
      return; // Everything translated
    }

    // Take next batch of 3 blocks for smooth streaming without API throttling
    const batch = candidates.slice(0, 3);
    const batchIds = new Set(batch.map((b) => b.id));

    const timer = setTimeout(async () => {
      if (isAutoLoopRunningRef.current) return;
      isAutoLoopRunningRef.current = true;

      setBlocks((prev) =>
        prev.map((b) => (batchIds.has(b.id) ? { ...b, isTranslating: true } : b))
      );

      try {
        const activeGlossary = glossary.filter((g) => g.enabled);
        const result = await callApiTranslate({
          blocks: batch.map((b) => ({
            id: b.id,
            type: b.type,
            sourceText: b.sourceText,
          })),
          sourceLang: meta.sourceLang,
          targetLang: meta.targetLang,
          promptTemplate: getCompiledPromptTemplate(),
          glossary: activeGlossary,
          stylePreference: selectedTemplate.stylePreference,
          apiConfig,
        });

        const map = new Map<string, { translation: string; notes?: string }>();
        (result.translations || []).forEach((t: any) => {
          if (t && t.id) {
            map.set(t.id, { translation: t.translation, notes: t.notes });
          }
        });

        setBlocks((prev) =>
          prev.map((b) => {
            if (map.has(b.id)) {
              const res = map.get(b.id)!;
              return {
                ...b,
                targetText: res.translation || b.targetText,
                notes: res.notes,
                isTranslating: false,
              };
            }
            if (batchIds.has(b.id)) {
              return { ...b, isTranslating: false };
            }
            return b;
          })
        );

        if (result.ok) {
          setAutoTranslateNotice(null);
        } else {
          setAutoTranslateNotice(`伴读流提示: ${result.error || '请求受阻，将自动顺延重试'}`);
          await new Promise((r) => setTimeout(r, 4000));
        }
      } catch (err: any) {
        console.warn('Auto stream translate warning:', err);
        setBlocks((prev) =>
          prev.map((b) => (batchIds.has(b.id) ? { ...b, isTranslating: false } : b))
        );
        setAutoTranslateNotice(`伴读翻译提示: ${err.message || '网络连接异常'}，稍后将自动续译`);
        await new Promise((r) => setTimeout(r, 4000));
      } finally {
        isAutoLoopRunningRef.current = false;
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [
    autoTranslateEnabled,
    isTranslating,
    blocks,
    currentReadBlock,
    meta.sourceLang,
    meta.targetLang,
    apiConfig,
    selectedTemplate,
    glossary,
    typography.keepEnglishNames,
  ]);

  // Handler: Batch Translate All Untranslated Blocks
  const handleTranslateAll = async () => {
    if (isTranslating || blocks.length === 0) return;

    // Filter only untranslated blocks to avoid wasting tokens and duplicate requests
    const untranslated = blocks.filter(
      (b) => !b.targetText || !b.targetText.trim() || b.targetText === b.sourceText
    );

    if (untranslated.length === 0) {
      alert('所有段落均已翻译完成！');
      return;
    }

    setIsTranslating(true);
    const BATCH_SIZE = 4;
    const activeGlossary = glossary.filter((g) => g.enabled);

    try {
      for (let i = 0; i < untranslated.length; i += BATCH_SIZE) {
        const batch = untranslated.slice(i, i + BATCH_SIZE);
        const batchIds = new Set(batch.map((b) => b.id));

        setBlocks((prev) =>
          prev.map((b) => (batchIds.has(b.id) ? { ...b, isTranslating: true } : b))
        );

        const result = await callApiTranslate({
          blocks: batch.map((b) => ({
            id: b.id,
            type: b.type,
            sourceText: b.sourceText,
          })),
          sourceLang: meta.sourceLang,
          targetLang: meta.targetLang,
          promptTemplate: getCompiledPromptTemplate(),
          glossary: activeGlossary,
          stylePreference: selectedTemplate.stylePreference,
          apiConfig,
        });

        const map = new Map<string, { translation: string; notes?: string }>();
        (result.translations || []).forEach((t: any) => {
          if (t && t.id) {
            map.set(t.id, { translation: t.translation, notes: t.notes });
          }
        });

        setBlocks((prev) =>
          prev.map((b) => {
            if (map.has(b.id)) {
              const res = map.get(b.id)!;
              return {
                ...b,
                targetText: res.translation || b.targetText,
                notes: res.notes,
                isTranslating: false,
              };
            }
            if (batchIds.has(b.id)) {
              return { ...b, isTranslating: false };
            }
            return b;
          })
        );
      }
    } catch (err: any) {
      console.error('Batch translate error:', err);
      setAutoTranslateNotice(`批量翻译提示: ${err.message}`);
    } finally {
      setIsTranslating(false);
    }
  };

  // Handler: Open single block polish
  const handleOpenPolishSingle = (block: DocumentBlock) => {
    setTargetBlockForPolish(block);
    setIsPolishOpen(true);
  };

  // Handler: Open whole document batch polish
  const handleOpenPolishAll = () => {
    setTargetBlockForPolish(null);
    setIsPolishOpen(true);
  };

  // Handler: Apply single block polish
  const handleApplySinglePolish = (blockId: string, polishedText: string, record: any) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b;
        const history = b.polishHistory || [];
        return {
          ...b,
          targetText: polishedText,
          polishHistory: [...history, record],
        };
      })
    );
  };

  // Handler: Batch Polish All translated blocks
  const handleBatchPolish = async (style: PolishStyle, customInstruction: string) => {
    setIsBatchPolishing(true);
    const translatedBlocks = blocks.filter((b) => b.targetText && b.targetText.trim());

    try {
      for (const b of translatedBlocks) {
        setBlocks((prev) =>
          prev.map((item) => (item.id === b.id ? { ...item, isPolishing: true } : item))
        );

        const res = await fetch('/api/polish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceText: b.sourceText,
            currentTranslation: b.targetText,
            polishStyle: style,
            customInstruction: `${customInstruction} ${typography.keepEnglishNames ? 'Keep character English names intact.' : ''}`,
            apiConfig,
          }),
        });

        const data = await res.json();
        if (res.ok && data.polishedText) {
          setBlocks((prev) =>
            prev.map((item) => {
              if (item.id !== b.id) return item;
              const history = item.polishHistory || [];
              return {
                ...item,
                targetText: data.polishedText,
                isPolishing: false,
                polishHistory: [
                  ...history,
                  {
                    id: `polish-${Date.now()}`,
                    originalTranslation: b.targetText,
                    polishedText: data.polishedText,
                    style,
                    explanation: data.improvementsSummary,
                    timestamp: Date.now(),
                  },
                ],
              };
            })
          );
        } else {
          setBlocks((prev) =>
            prev.map((item) => (item.id === b.id ? { ...item, isPolishing: false } : item))
          );
        }
      }
    } catch (err: any) {
      console.error('Batch polish error:', err);
      alert(`批量润色中断: ${err.message}`);
    } finally {
      setIsBatchPolishing(false);
    }
  };

  // Handlers for Bookshelf (100% Client-Side Local Storage)
  const handleSaveCurrentStory = () => {
    setBookshelf((prev) => {
      const activeIndex = prev.findIndex((s) => s.id === meta.id);
      const transCount = blocks.filter(
        (b) => b.targetText?.trim() && b.targetText !== b.sourceText
      ).length;

      if (activeIndex >= 0) {
        const updated = [...prev];
        updated[activeIndex] = {
          ...updated[activeIndex],
          title: meta.title,
          fileName: meta.fileName,
          fileType: meta.fileType,
          ao3Meta: meta.ao3Meta,
          blocks,
          bookmarks,
          totalBlocks: blocks.length,
          translatedBlocks: transCount,
          updatedAt: Date.now(),
        };
        saveBookshelfToStorage(updated);
        return updated;
      } else {
        const newStory: BookshelfStory = {
          id: meta.id,
          title: meta.title,
          fileName: meta.fileName,
          fileType: meta.fileType,
          author: meta.ao3Meta?.author,
          fandoms: meta.ao3Meta?.fandoms,
          coverColor: '#990000',
          totalBlocks: blocks.length,
          translatedBlocks: transCount,
          estimatedWords: blocks.reduce((acc, b) => acc + b.sourceText.split(' ').length, 0),
          updatedAt: Date.now(),
          createdAt: meta.createdAt || Date.now(),
          blocks,
          bookmarks,
          ao3Meta: meta.ao3Meta,
          sourceLang: meta.sourceLang,
          targetLang: meta.targetLang,
        };
        const updated = [newStory, ...prev];
        saveBookshelfToStorage(updated);
        return updated;
      }
    });
  };

  const handleSelectStory = (storyId: string) => {
    // 1. Save current active story
    handleSaveCurrentStory();

    // 2. Find target story
    const target = bookshelf.find((s) => s.id === storyId);
    if (!target) return;

    setMeta({
      id: target.id,
      title: target.title,
      fileName: target.fileName,
      fileType: target.fileType,
      sourceLang: target.sourceLang || 'English',
      targetLang: target.targetLang || 'Chinese (Simplified)',
      createdAt: target.createdAt,
      updatedAt: Date.now(),
      ao3Meta: target.ao3Meta,
    });
    setBlocks(target.blocks || []);
    setBookmarks(target.bookmarks || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteStory = (storyId: string) => {
    setBookshelf((prev) => {
      const nextShelf = prev.filter((s) => s.id !== storyId);
      saveBookshelfToStorage(nextShelf);
      if (meta.id === storyId && nextShelf.length > 0) {
        const next = nextShelf[0];
        setMeta({
          id: next.id,
          title: next.title,
          fileName: next.fileName,
          fileType: next.fileType,
          sourceLang: next.sourceLang || 'English',
          targetLang: next.targetLang || 'Chinese (Simplified)',
          createdAt: next.createdAt,
          updatedAt: Date.now(),
          ao3Meta: next.ao3Meta,
        });
        setBlocks(next.blocks || []);
        setBookmarks(next.bookmarks || []);
      }
      return nextShelf;
    });
  };

  const handleRestoreBackup = (importedStories: BookshelfStory[]) => {
    setBookshelf(importedStories);
    saveBookshelfToStorage(importedStories);
    if (importedStories.length > 0) {
      const first = importedStories[0];
      setMeta({
        id: first.id,
        title: first.title,
        fileName: first.fileName,
        fileType: first.fileType,
        sourceLang: first.sourceLang || 'English',
        targetLang: first.targetLang || 'Chinese (Simplified)',
        createdAt: first.createdAt,
        updatedAt: Date.now(),
        ao3Meta: first.ao3Meta,
      });
      setBlocks(first.blocks || []);
      setBookmarks(first.bookmarks || []);
    }
  };

  // Handler: Import new document
  const handleImportDocument = (newBlocks: DocumentBlock[], newMeta: DocumentMeta) => {
    // 1. Save current active document to shelf
    handleSaveCurrentStory();

    // 2. Set new document active
    setBlocks(newBlocks);
    setMeta(newMeta);
    setBookmarks([]);

    // 3. Add to bookshelf so new stories are immediately remembered
    const newShelfStory: BookshelfStory = {
      id: newMeta.id,
      title: newMeta.title,
      fileName: newMeta.fileName,
      fileType: newMeta.fileType,
      author: newMeta.ao3Meta?.author,
      fandoms: newMeta.ao3Meta?.fandoms,
      coverColor: '#990000',
      totalBlocks: newBlocks.length,
      translatedBlocks: newBlocks.filter(
        (b) => b.targetText?.trim() && b.targetText !== b.sourceText
      ).length,
      estimatedWords: newBlocks.reduce((acc, b) => acc + b.sourceText.split(' ').length, 0),
      updatedAt: Date.now(),
      createdAt: newMeta.createdAt || Date.now(),
      blocks: newBlocks,
      bookmarks: [],
      ao3Meta: newMeta.ao3Meta,
      sourceLang: newMeta.sourceLang,
      targetLang: newMeta.targetLang,
    };

    setBookshelf((prev) => {
      const filtered = prev.filter((s) => s.id !== newMeta.id);
      const updated = [newShelfStory, ...filtered];
      saveBookshelfToStorage(updated);
      return updated;
    });
  };


  // Handlers for Bookmarks
  const handleToggleBookmark = (block: DocumentBlock, index: number) => {
    setBookmarks((prev) => {
      const existing = prev.find((b) => b.blockId === block.id);
      if (existing) {
        return prev.filter((b) => b.blockId !== block.id);
      } else {
        const newBm: BookmarkType = {
          id: `bm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          blockId: block.id,
          blockIndex: index,
          previewText: block.targetText || block.sourceText,
          sourcePreview: block.sourceText,
          createdAt: Date.now(),
        };
        return [...prev, newBm];
      }
    });
  };

  const handleJumpToBlock = (blockId: string) => {
    const el = document.getElementById(`block-${blockId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedBlockId(blockId);
      setTimeout(() => {
        setHighlightedBlockId((curr) => (curr === blockId ? null : curr));
      }, 2500);
    }
  };

  const handleDeleteBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleUpdateBookmarkNote = (id: string, note: string) => {
    setBookmarks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, note } : b))
    );
  };

  const handleClearAllBookmarks = () => {
    setBookmarks([]);
  };

  const translatedCount = blocks.filter(
    (b) => b.targetText && b.targetText.trim() && b.targetText !== b.sourceText
  ).length;

  // Reading time and word count statistics for current article
  const currentStoryStats = calculateStoryStats(blocks, meta.ao3Meta?.stats?.words);

  return (
    <div
      className={`min-h-screen ${currentTheme.appBg} ${currentTheme.textPrimary} transition-colors flex flex-col selection:bg-[#990000]/20`}
    >
      {/* Top Navigation */}
      <Navbar
        meta={meta}
        viewMode={viewMode}
        setViewMode={setViewMode}
        bookshelfCount={bookshelf.length}
        onOpenBookshelf={() => setIsBookshelfOpen(true)}
        bookmarkCount={bookmarks.length}
        onOpenBookmarks={() => setIsBookmarkDrawerOpen(true)}
        apiConfig={apiConfig}
        onOpenApiSettings={() => setIsApiSettingsOpen(true)}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenStyle={() => setIsStyleOpen(true)}
        onOpenPrompt={() => setIsPromptOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenPolishAll={handleOpenPolishAll}
        onTranslateAll={handleTranslateAll}
        isTranslating={isTranslating}
        translatedCount={translatedCount}
        totalCount={blocks.length}
        autoTranslateEnabled={autoTranslateEnabled}
        onToggleAutoTranslate={toggleAutoTranslate}
      />

      {/* Main Workspace Canvas */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 pb-28 lg:pb-12">
        {/* If Story Metadata exists, render the Header Card */}
        {meta.ao3Meta ? (
          <Ao3HeaderCard
            meta={meta.ao3Meta}
            title={meta.title}
            theme={currentTheme}
            totalWordsEstimate={currentStoryStats.wordCount}
          />
        ) : (
          /* General Header Card */
          <div
            className={`no-print mb-6 p-4 sm:p-5 rounded-2xl border ${currentTheme.cardBg} ${currentTheme.border} shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#990000]/10 text-[#990000]">
                  {meta.fileType.toUpperCase()} 文档
                </span>
                <span className="text-xs text-zinc-400">|</span>
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  生效提示词: <strong>{selectedTemplate.name}</strong>
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {meta.title}
              </h1>
              {/* Reading time estimate */}
              <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300 font-medium pt-0.5">
                <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-zinc-500 dark:text-zinc-400">约 {currentStoryStats.wordCount.toLocaleString()} 词</span>
                <span className="text-zinc-300 dark:text-zinc-600">·</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{currentStoryStats.formattedLabel}</span>
              </div>
            </div>
          </div>
        )}


        {/* Quick Fanfiction Preference Bar */}
        <div className="no-print flex items-center justify-between gap-2 mb-4 px-1 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Bookshelf Quick Trigger */}
            <button
              onClick={() => setIsBookshelfOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#990000]/30 bg-red-50/70 dark:bg-red-950/40 text-[#990000] dark:text-red-300 font-semibold hover:bg-red-100 dark:hover:bg-red-900/40 transition shadow-2xs"
              title="打开我的本地书架（查看、切换、备份作品）"
            >
              <Library className="h-3.5 w-3.5 text-[#990000]" />
              <span>本地书架 ({bookshelf.length}部)</span>
            </button>

            <button
              onClick={() =>
                setTypography((prev) => ({
                  ...prev,
                  keepEnglishNames: !prev.keepEnglishNames,
                }))
              }
              className={`px-2.5 py-1 rounded-lg border font-medium transition flex items-center gap-1.5 ${
                typography.keepEnglishNames
                  ? 'border-[#990000] bg-red-50 dark:bg-red-950/40 text-[#990000]'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-800'
              }`}
              title="切换是否保留角色英文原名（如 Sherlock, John, Steve）"
            >
              <span>{typography.keepEnglishNames ? '✓ 已开启英文原名人名' : '中文音译人名'}</span>
            </button>

            {/* Auto Translate Stream Toggle */}
            <button
              onClick={toggleAutoTranslate}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-semibold transition ${
                autoTranslateEnabled
                  ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-800'
              }`}
              title="自动伴读翻译：阅读或滚动时，系统在后台自动顺延翻译后续段落"
            >
              <Zap className={`h-3.5 w-3.5 ${autoTranslateEnabled ? 'fill-emerald-500 text-emerald-500' : 'text-zinc-400'}`} />
              <span>伴读自动翻译: {autoTranslateEnabled ? '开启中' : '已暂停'}</span>
            </button>

            {/* Bookmarks Quick Trigger */}
            <button
              onClick={() => setIsBookmarkDrawerOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-700/80 bg-amber-50/70 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 font-medium hover:bg-amber-100 dark:hover:bg-amber-900/40 transition shadow-2xs"
              title="查看与管理段落书签"
            >
              <BookmarkIcon
                className={`h-3.5 w-3.5 ${
                  bookmarks.length > 0 ? 'fill-amber-500 text-amber-600' : 'text-amber-600'
                }`}
              />
              <span>书签收藏 ({bookmarks.length})</span>
            </button>

            <span className="text-zinc-400 hidden sm:inline">|</span>

            <span className="text-zinc-500 hidden sm:inline">
              阅读底色：<strong>{currentTheme.name}</strong>
            </span>

            <span className="text-zinc-400 hidden lg:inline">|</span>

            <span className="text-[11px] text-zinc-400 hidden lg:inline bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full">
              💡 手机长按 / 鼠标按住任意段落可即时浮窗对照英文原文与加书签
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPromptOpen(true)}
              className="text-xs text-[#990000] hover:underline flex items-center gap-1 font-medium"
            >
              <BookmarkIcon className="h-3.5 w-3.5" />
              <span>同人提示词模板 ({selectedTemplate.name.split(' ')[0]})</span>
            </button>
          </div>
        </div>

        {/* Mobile View Mode Switcher: Clear, prominent 1-tap toggling */}
        <div className="lg:hidden no-print mb-4 p-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between gap-1">
          <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 pl-2 shrink-0">
            阅读模式:
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('target-only')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'target-only'
                  ? 'bg-[#990000] text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <FileCheck className="h-3.5 w-3.5" />
              <span>全译文</span>
            </button>
            <button
              onClick={() => setViewMode('interlinear')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                viewMode === 'interlinear'
                  ? 'bg-[#990000] text-white shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <AlignJustify className="h-3.5 w-3.5" />
              <span>上下逐段</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                viewMode === 'split'
                  ? 'bg-[#990000] text-white shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Columns className="h-3.5 w-3.5" />
              <span>左右双栏</span>
            </button>
          </div>
        </div>

        {/* Progress Bar at the Top of Reader Area */}
        <ReaderProgressBar
          totalBlocks={blocks.length}
          translatedBlocks={translatedCount}
          currentReadBlock={currentReadBlock}
          theme={currentTheme}
          onJumpToUntranslated={handleJumpToUntranslated}
          isTranslating={isTranslating}
          totalWords={currentStoryStats.wordCount}
          estimatedMinutes={currentStoryStats.minutes}
          autoTranslateEnabled={autoTranslateEnabled}
          onToggleAutoTranslate={toggleAutoTranslate}
          onTranslateAll={handleTranslateAll}
        />

        {/* Auto-Translate Notice if retry/backoff */}
        {autoTranslateNotice && (
          <div className="no-print mb-4 px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300 flex items-center justify-between gap-2 shadow-2xs animate-fade-in">
            <span className="flex items-center gap-1.5">
              <Info className="h-4 w-4 text-blue-600 shrink-0" />
              <span>{autoTranslateNotice}</span>
            </span>
            <button
              onClick={() => setAutoTranslateNotice(null)}
              className="text-[11px] font-semibold text-blue-600 hover:underline shrink-0"
            >
              关闭
            </button>
          </div>
        )}

        {/* Mode Status Pill Notice when in Target-Only */}
        {viewMode === 'target-only' && (
          <div className="no-print mb-4 px-3.5 py-2.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-[#990000] shrink-0" />
              <span>
                <strong>「纯译文 (全篇中文)」伴读模式</strong>
                {translatedCount < blocks.length ? (
                  autoTranslateEnabled ? (
                    <span className="ml-1 text-emerald-800 dark:text-emerald-300 font-semibold">
                      · 正在后台智能伴读自动翻译下文（已译 {translatedCount}/{blocks.length} 段）
                    </span>
                  ) : (
                    <span className="ml-1 text-amber-800 dark:text-amber-300">
                      · 伴读自动翻译已暂停（已译 {translatedCount}/{blocks.length} 段）
                    </span>
                  )
                ) : (
                  <span className="ml-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                    · 全篇段落已全部翻译完成
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto text-[11px]">
              {translatedCount < blocks.length && (
                <button
                  onClick={toggleAutoTranslate}
                  className="px-2 py-1 rounded-md bg-white dark:bg-zinc-800 border border-amber-300 dark:border-amber-700 font-bold text-amber-900 dark:text-amber-200 hover:bg-amber-100 transition shadow-2xs"
                >
                  {autoTranslateEnabled ? '暂停自动伴读' : '开启自动伴读'}
                </button>
              )}
              {translatedCount < blocks.length && (
                <button
                  onClick={handleTranslateAll}
                  disabled={isTranslating}
                  className="px-2 py-1 rounded-md bg-[#990000] text-white font-bold hover:bg-[#800000] transition shadow-2xs"
                >
                  加速全译
                </button>
              )}
              <button
                onClick={() => setViewMode('interlinear')}
                className="font-semibold text-[#990000] hover:underline"
              >
                切回双语
              </button>
            </div>
          </div>
        )}

        {/* Content Section / Bilingual Blocks */}
        <div
          className={`rounded-2xl border ${currentTheme.cardBg} ${currentTheme.border} p-4 sm:p-8 shadow-sm transition-all`}
        >
          {blocks.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="p-4 rounded-full bg-[#990000]/10 text-[#990000] w-16 h-16 mx-auto flex items-center justify-center">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                当前暂无载入的故事文档
              </h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                点击上方“导入故事”上传本地 HTML / PDF，或选用内置公版经典范例
              </p>
              <button
                onClick={() => setIsImportOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#990000] hover:bg-[#800000] text-white text-xs font-semibold shadow-xs transition"
              >
                立即导入故事
              </button>
            </div>
          ) : (
            <div>
              {/* Column Titles for Split View */}
              {viewMode === 'split' && (
                <div className="hidden lg:flex gap-6 pb-4 mb-4 border-b border-black/10 dark:border-white/10 text-xs font-bold uppercase tracking-wider text-zinc-400">
                  <div
                    className={
                      typography.columnRatio === '45-55'
                        ? 'w-[45%]'
                        : typography.columnRatio === '55-45'
                        ? 'w-[55%]'
                        : 'w-1/2'
                    }
                  >
                    英文原文 ({meta.sourceLang || 'English'})
                  </div>
                  <div
                    className={
                      typography.columnRatio === '45-55'
                        ? 'w-[55%]'
                        : typography.columnRatio === '55-45'
                        ? 'w-[45%]'
                        : 'w-1/2'
                    }
                  >
                    精译中文对照 ({meta.targetLang || 'Chinese'})
                  </div>
                </div>
              )}

              {/* Render Blocks */}
              <div className="divide-y divide-black/5 dark:divide-white/5">
                {blocks.map((block, idx) => (
                  <BlockRow
                    key={block.id}
                    block={block}
                    index={idx}
                    viewMode={viewMode}
                    typography={typography}
                    theme={currentTheme}
                    autoTranslateEnabled={autoTranslateEnabled}
                    isBookmarked={bookmarks.some((b) => b.blockId === block.id)}
                    isHighlighted={highlightedBlockId === block.id}
                    onToggleBookmark={handleToggleBookmark}
                    onUpdateTargetText={handleUpdateTargetText}
                    onTranslateSingle={handleTranslateSingle}
                    onOpenPolishSingle={handleOpenPolishSingle}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <div className="lg:hidden no-print fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-2 py-2 flex items-center justify-around shadow-lg">
        {/* Toggle Mode Button: Dedicated & Highly visible */}
        <button
          onClick={() =>
            setViewMode(
              viewMode === 'target-only' ? 'interlinear' : 'target-only'
            )
          }
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition ${
            viewMode === 'target-only'
              ? 'bg-[#990000]/10 text-[#990000] font-bold'
              : 'text-zinc-600 dark:text-zinc-300'
          }`}
          title="点击切换：全篇纯译文 ↔ 双语对照"
        >
          {viewMode === 'target-only' ? (
            <FileCheck className="h-4 w-4 text-[#990000]" />
          ) : viewMode === 'split' ? (
            <Columns className="h-4 w-4" />
          ) : (
            <AlignJustify className="h-4 w-4" />
          )}
          <span className="text-[10px]">
            {viewMode === 'target-only' ? '纯译文' : '全译文'}
          </span>
        </button>

        {/* Auto Translate Stream Toggle on Mobile */}
        <button
          onClick={toggleAutoTranslate}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] transition ${
            autoTranslateEnabled
              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
              : 'text-zinc-500 dark:text-zinc-400 font-medium'
          }`}
          title="切换自动伴读流式翻译"
        >
          <Zap
            className={`h-4 w-4 ${
              autoTranslateEnabled ? 'fill-emerald-500 text-emerald-500' : 'text-zinc-400'
            }`}
          />
          <span>{autoTranslateEnabled ? '伴读开' : '伴读停'}</span>
        </button>

        {/* Style */}
        <button
          onClick={() => setIsStyleOpen(true)}
          className="flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium text-zinc-600 dark:text-zinc-300"
        >
          <Palette className="h-4 w-4" />
          <span>排版</span>
        </button>

        {/* Translate All */}
        <button
          onClick={handleTranslateAll}
          disabled={isTranslating}
          className="flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-bold text-[#990000]"
        >
          <RefreshCw className={`h-4 w-4 ${isTranslating ? 'animate-spin' : ''}`} />
          <span>{isTranslating ? '翻译中' : '全译'}</span>
        </button>

        {/* Polish */}
        <button
          onClick={handleOpenPolishAll}
          className="flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium text-purple-600 dark:text-purple-400"
        >
          <Sparkles className="h-4 w-4" />
          <span>AI润色</span>
        </button>

        {/* Export */}
        <button
          onClick={() => setIsExportOpen(true)}
          className="flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium text-zinc-900 dark:text-zinc-100"
        >
          <Download className="h-4 w-4" />
          <span>导出</span>
        </button>
      </div>

      {/* Hidden Print Container for High-Fidelity Vector PDF Export */}
      <PrintContainer blocks={blocks} meta={meta} typography={typography} />

      {/* Modals */}
      <StyleModal
        isOpen={isStyleOpen}
        onClose={() => setIsStyleOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={setCurrentTheme}
        typography={typography}
        onChangeTypography={setTypography}
      />

      <PromptModal
        isOpen={isPromptOpen}
        onClose={() => setIsPromptOpen(false)}
        selectedTemplateId={selectedTemplate.id}
        onSelectTemplate={setSelectedTemplate}
        customTemplates={customTemplates}
        onSaveCustomTemplate={(tmpl) => setCustomTemplates([...customTemplates, tmpl])}
        onDeleteCustomTemplate={(id) =>
          setCustomTemplates(customTemplates.filter((t) => t.id !== id))
        }
        glossary={glossary}
        onUpdateGlossary={setGlossary}
      />

      <PolishModal
        isOpen={isPolishOpen}
        onClose={() => {
          setIsPolishOpen(false);
          setTargetBlockForPolish(null);
        }}
        targetBlock={targetBlockForPolish}
        allBlocks={blocks}
        apiConfig={apiConfig}
        onApplySinglePolish={handleApplySinglePolish}
        onBatchPolish={handleBatchPolish}
        isBatchPolishing={isBatchPolishing}
      />

      <ApiSettingsModal
        isOpen={isApiSettingsOpen}
        onClose={() => setIsApiSettingsOpen(false)}
        apiConfig={apiConfig}
        onSaveConfig={setApiConfig}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        blocks={blocks}
        meta={meta}
        typography={typography}
      />

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportDocument={handleImportDocument}
      />

      <BookmarkDrawer
        isOpen={isBookmarkDrawerOpen}
        onClose={() => setIsBookmarkDrawerOpen(false)}
        bookmarks={bookmarks}
        meta={meta}
        onJumpToBlock={handleJumpToBlock}
        onDeleteBookmark={handleDeleteBookmark}
        onUpdateBookmarkNote={handleUpdateBookmarkNote}
        onClearAllBookmarks={handleClearAllBookmarks}
      />

      <BookshelfDrawer
        isOpen={isBookshelfOpen}
        onClose={() => setIsBookshelfOpen(false)}
        bookshelf={bookshelf}
        currentStoryId={meta.id}
        onSelectStory={handleSelectStory}
        onSaveCurrentStory={handleSaveCurrentStory}
        onDeleteStory={handleDeleteStory}
        onImportNewStory={() => setIsImportOpen(true)}
        onRestoreBackup={handleRestoreBackup}
      />
    </div>
  );
}

