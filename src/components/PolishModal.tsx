import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Check,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  Lightbulb,
  FileText,
  Wand2,
} from 'lucide-react';
import { DocumentBlock, PolishStyle, UserApiConfig } from '../types/document';

interface PolishModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetBlock?: DocumentBlock | null;
  allBlocks: DocumentBlock[];
  apiConfig?: UserApiConfig;
  onApplySinglePolish: (blockId: string, polishedText: string, record: any) => void;
  onBatchPolish: (style: PolishStyle, customInstruction: string) => Promise<void>;
  isBatchPolishing: boolean;
}

export const PolishModal: React.FC<PolishModalProps> = ({
  isOpen,
  onClose,
  targetBlock,
  allBlocks,
  apiConfig,
  onApplySinglePolish,
  onBatchPolish,
  isBatchPolishing,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<PolishStyle>('faithfulness_elegance');
  const [customInstruction, setCustomInstruction] = useState('');
  const [isPolishingSingle, setIsPolishingSingle] = useState(false);
  const [singleResult, setSingleResult] = useState<{
    polishedText: string;
    improvementsSummary: string;
    keyTerminology?: string[];
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const isSingle = !!targetBlock;

  const styleOptions: {
    id: PolishStyle;
    title: string;
    badge: string;
    desc: string;
    icon: string;
  }[] = [
    {
      id: 'faithfulness_elegance',
      title: '细腻情感与心理暗涌',
      badge: '同人首选 · 情感张力',
      desc: '捕捉角色间的微表情、呼吸频率、触碰温度与心理潜台词，彻底消除机械直译腔。',
      icon: '✨',
    },
    {
      id: 'colloquial',
      title: '角色对白与互怼推拉',
      badge: '对话生动 · 防止OOC',
      desc: '台词机智鲜活接地气，精准保留两人的眼神试探、幽默调侃与暗潮涌动的性张力。',
      icon: '💬',
    },
    {
      id: 'tech_modern',
      title: 'ABO / 哨向设定感官深度',
      badge: '特殊设定/AU',
      desc: '规范信息素浓度、易感期压迫感、精神图景连结等特殊设定，强化感官沉浸体验。',
      icon: '🧬',
    },
    {
      id: 'academic',
      title: '西方奇幻与史诗厚重笔触',
      badge: '古典/奇幻',
      desc: '用词考究古雅，重现中世纪古堡、誓言与宿命物哀感，文辞洗练华美。',
      icon: '🏰',
    },
    {
      id: 'business',
      title: '轻快自然短句通读',
      badge: '极简去翻译腔',
      desc: '化解西化长定语从句，转化为地道爽快的中文小说短句，夜读顺畅不烧脑。',
      icon: '☕',
    },
  ];

  const handleRunSinglePolish = async () => {
    if (!targetBlock) return;
    setIsPolishingSingle(true);
    setErrorMessage('');
    setSingleResult(null);

    try {
      const res = await fetch('/api/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceText: targetBlock.sourceText,
          currentTranslation: targetBlock.targetText || targetBlock.sourceText,
          polishStyle: selectedStyle,
          customInstruction,
          apiConfig,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'AI润色失败');
      }

      setSingleResult(data);
    } catch (err: any) {
      setErrorMessage(err.message || '网络或API异常');
    } finally {
      setIsPolishingSingle(false);
    }
  };

  const handleApplySingle = () => {
    if (!targetBlock || !singleResult) return;
    onApplySinglePolish(targetBlock.id, singleResult.polishedText, {
      id: `polish-${Date.now()}`,
      originalTranslation: targetBlock.targetText,
      polishedText: singleResult.polishedText,
      style: selectedStyle,
      explanation: singleResult.improvementsSummary,
      timestamp: Date.now(),
    });
    onClose();
  };

  const handleRunBatch = async () => {
    await onBatchPolish(selectedStyle, customInstruction);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {isSingle ? 'AI段落精细润色' : 'AI全篇智能深度润色'}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                多风格自然语言深度重构，根除“机器翻译腔”，使中文译本流畅洗练
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Style selection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2.5">
              选择润色风格意图 (Polish Style)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {styleOptions.map((opt) => {
                const isSelected = selectedStyle === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedStyle(opt.id)}
                    className={`p-3 rounded-xl border-2 text-left transition ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/30 shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        <span>{opt.icon}</span>
                        <span>{opt.title}</span>
                      </div>
                      {isSelected && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-white">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                    <span className="inline-block text-[10px] px-1.5 py-0.5 rounded font-medium bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 mb-1">
                      {opt.badge}
                    </span>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
                      {opt.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Instruction */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              补充个性化润色要求 (可选)
            </label>
            <input
              type="text"
              value={customInstruction}
              onChange={(e) => setCustomInstruction(e.target.value)}
              placeholder="例如：打破长句，多用成语；或者语气更严谨，避免口语化"
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* If Single Block Mode: show before and after diff */}
          {isSingle && targetBlock && (
            <div className="space-y-4 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              {/* Original & Current */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700">
                  <span className="text-[11px] font-semibold text-zinc-500 block mb-1">
                    原文 (Source):
                  </span>
                  <div className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed max-h-28 overflow-y-auto">
                    {targetBlock.sourceText}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                  <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 block mb-1">
                    当前初译 (Current Translation):
                  </span>
                  <div className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed max-h-28 overflow-y-auto">
                    {targetBlock.targetText || '（尚未翻译）'}
                  </div>
                </div>
              </div>

              {/* Action trigger button */}
              {!singleResult && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={handleRunSinglePolish}
                    disabled={isPolishingSingle}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-purple-600/20 transition active:scale-95"
                  >
                    <Wand2 className={`h-4 w-4 ${isPolishingSingle ? 'animate-spin' : ''}`} />
                    <span>{isPolishingSingle ? 'AI正在深度润色中...' : '开始润色本段'}</span>
                  </button>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs border border-red-200">
                  {errorMessage}
                </div>
              )}

              {/* Polished Result View */}
              {singleResult && (
                <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300">
                      <Sparkles className="h-4 w-4" /> AI润色后新译文:
                    </span>
                    <button
                      onClick={handleRunSinglePolish}
                      disabled={isPolishingSingle}
                      className="text-[11px] text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" /> 换个表达重新润色
                    </button>
                  </div>

                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed bg-white/80 dark:bg-zinc-900/80 p-3 rounded-lg border border-purple-200/70 dark:border-purple-800/70">
                    {singleResult.polishedText}
                  </div>

                  {/* Summary of improvements */}
                  <div className="text-xs text-zinc-600 dark:text-zinc-300 flex items-start gap-2 bg-purple-100/60 dark:bg-purple-900/30 p-2.5 rounded-lg">
                    <Lightbulb className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-purple-800 dark:text-purple-200">
                        润色提升解析：
                      </span>
                      {singleResult.improvementsSummary}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* If Batch Mode */}
          {!isSingle && (
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-300 space-y-2">
              <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                将对全篇已翻译的段落进行批量流式润色
              </div>
              <div>
                共检测到 {allBlocks.filter((b) => b.targetText).length} 个已翻译段落。AI将按所选【{styleOptions.find(o => o.id === selectedStyle)?.title}】风格依次提升表达质量，消除生硬长句并保持原排版格式不变。
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-3.5 bg-zinc-50 dark:bg-zinc-900/50 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            取消
          </button>
          {isSingle ? (
            <button
              onClick={handleApplySingle}
              disabled={!singleResult}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium text-xs sm:text-sm shadow-xs transition"
            >
              采纳并应用此润色
            </button>
          ) : (
            <button
              onClick={handleRunBatch}
              disabled={isBatchPolishing}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium text-xs sm:text-sm shadow-xs transition flex items-center gap-1.5"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isBatchPolishing ? '全篇润色中...' : '启动全篇AI润色'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
