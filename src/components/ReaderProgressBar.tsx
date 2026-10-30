import React, { useState } from 'react';
import {
  BookOpen,
  Languages,
  CheckCircle2,
  RefreshCw,
  ArrowDownCircle,
  Eye,
  Sliders,
  Clock,
  Zap,
  Sparkles,
} from 'lucide-react';
import { ThemeConfig } from '../types/document';
import { formatReadingTime } from '../utils/readingTime';

interface ReaderProgressBarProps {
  totalBlocks: number;
  translatedBlocks: number;
  currentReadBlock: number;
  theme: ThemeConfig;
  onJumpToUntranslated?: () => void;
  isTranslating?: boolean;
  totalWords?: number;
  estimatedMinutes?: number;
  autoTranslateEnabled?: boolean;
  onToggleAutoTranslate?: () => void;
  onTranslateAll?: () => void;
}

export const ReaderProgressBar: React.FC<ReaderProgressBarProps> = ({
  totalBlocks,
  translatedBlocks,
  currentReadBlock,
  theme,
  onJumpToUntranslated,
  isTranslating = false,
  totalWords = 0,
  estimatedMinutes = 0,
  autoTranslateEnabled = true,
  onToggleAutoTranslate,
  onTranslateAll,
}) => {
  const [activeMetric, setActiveMetric] = useState<'both' | 'translated' | 'reading'>('both');

  if (totalBlocks === 0) return null;

  const translationPercent = Math.min(100, Math.round((translatedBlocks / totalBlocks) * 100));
  const readingPercent = Math.min(
    100,
    Math.max(0, Math.round((currentReadBlock / totalBlocks) * 100))
  );

  // Remaining reading time calculation
  const remainingFraction = Math.max(0, (totalBlocks - currentReadBlock) / totalBlocks);
  const remainingMinutes = estimatedMinutes > 0 ? Math.max(0, Math.round(estimatedMinutes * remainingFraction)) : 0;

  return (
    <div className="no-print mb-6 rounded-2xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xs p-3.5 sm:p-4 shadow-xs space-y-2.5 transition-all">
      {/* Top Meta & Toggle Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        {/* Metrics Label */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          {/* Translation Metric */}
          <button
            onClick={() => setActiveMetric(activeMetric === 'translated' ? 'both' : 'translated')}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition ${
              activeMetric === 'translated' || activeMetric === 'both'
                ? 'bg-[#990000]/10 text-[#990000] font-bold'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Languages className="h-3.5 w-3.5" />
            <span>翻译进度:</span>
            <span className="font-mono font-bold">
              {translatedBlocks}/{totalBlocks} 段 ({translationPercent}%)
            </span>
            {translationPercent === 100 && (
              <CheckCircle2 className="h-3 w-3 text-emerald-600 ml-0.5" />
            )}
          </button>

          <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">|</span>

          {/* Reading Metric */}
          <button
            onClick={() => setActiveMetric(activeMetric === 'reading' ? 'both' : 'reading')}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition ${
              activeMetric === 'reading' || activeMetric === 'both'
                ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 font-bold'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>阅读进度:</span>
            <span className="font-mono font-bold">
              已读至第 {currentReadBlock}/{totalBlocks} 段 ({readingPercent}%)
            </span>
          </button>

          {/* Reading Time Planning Badge */}
          {estimatedMinutes > 0 && (
            <>
              <span className="text-zinc-300 dark:text-zinc-700 hidden md:inline">|</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium">
                <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span>预计阅读时间：<strong className="text-zinc-900 dark:text-zinc-100">{estimatedMinutes} 分钟</strong></span>
                {currentReadBlock > 1 && remainingMinutes > 0 && (
                  <span className="text-zinc-400 text-[11px] font-mono">
                    (剩余约 {remainingMinutes} 分钟)
                  </span>
                )}
              </span>
            </>
          )}
        </div>


        {/* Auto-translate stream controls and quick jump */}
        <div className="flex items-center gap-2 self-end sm:self-auto text-[11px] flex-wrap">
          {/* Auto Translate Stream Toggle */}
          {onToggleAutoTranslate && (
            <button
              onClick={onToggleAutoTranslate}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition font-medium ${
                autoTranslateEnabled
                  ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                  : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
              title="自动流式伴读翻译：阅读或滚动时，系统在后台自动翻译即将阅读的段落"
            >
              <Zap className={`h-3 w-3 ${autoTranslateEnabled ? 'fill-emerald-500 text-emerald-500' : 'text-zinc-400'}`} />
              <span>伴读自动翻译: {autoTranslateEnabled ? '开启中' : '已暂停'}</span>
            </button>
          )}

          {isTranslating ? (
            <span className="flex items-center gap-1 text-[#990000] font-medium animate-pulse px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/40">
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span>伴读翻译中...</span>
            </span>
          ) : (
            translatedBlocks < totalBlocks && (
              <>
                {onTranslateAll && (
                  <button
                    onClick={onTranslateAll}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#990000] text-white hover:bg-[#800000] transition shadow-2xs font-semibold"
                    title="立即加速翻译剩余全篇"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>一键全篇速译</span>
                  </button>
                )}
                {onJumpToUntranslated && (
                  <button
                    onClick={onJumpToUntranslated}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition"
                    title="跳至首个未翻译段落"
                  >
                    <ArrowDownCircle className="h-3 w-3" />
                    <span>定位未译</span>
                  </button>
                )}
              </>
            )
          )}
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-1.5">
        {/* Translation Bar */}
        {(activeMetric === 'both' || activeMetric === 'translated') && (
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-zinc-400 font-medium px-0.5">
              <span>翻译完成度</span>
              <span className="font-mono text-[#990000]">{translationPercent}%</span>
            </div>
            <div className="w-full bg-zinc-200/80 dark:bg-zinc-800 rounded-full h-2 overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-[#990000] via-[#c23b3b] to-[#e64a4a] rounded-full transition-all duration-300 shadow-xs"
                style={{ width: `${translationPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Reading Scroll Bar */}
        {(activeMetric === 'both' || activeMetric === 'reading') && (
          <div className="space-y-1 pt-0.5">
            <div className="flex justify-between text-[10px] text-zinc-400 font-medium px-0.5">
              <span>阅读当前进度 (随页面滚动实时定位)</span>
              <span className="font-mono text-amber-700 dark:text-amber-400">{readingPercent}%</span>
            </div>
            <div className="w-full bg-zinc-200/80 dark:bg-zinc-800 rounded-full h-2 overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-600 rounded-full transition-all duration-150"
                style={{ width: `${readingPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
