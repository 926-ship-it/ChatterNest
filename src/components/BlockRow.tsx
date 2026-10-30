import React, { useState, useRef } from 'react';
import {
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Edit3,
  MessageSquare,
  History,
  CornerDownRight,
  Eye,
  X,
  BookOpen,
  Bookmark as BookmarkIcon,
} from 'lucide-react';
import { DocumentBlock, ViewMode, TypographyConfig, ThemeConfig } from '../types/document';

interface BlockRowProps {
  block: DocumentBlock;
  index: number;
  viewMode: ViewMode;
  typography: TypographyConfig;
  theme: ThemeConfig;
  autoTranslateEnabled?: boolean;
  isBookmarked?: boolean;
  isHighlighted?: boolean;
  onToggleBookmark?: (block: DocumentBlock, index: number) => void;
  onUpdateTargetText: (id: string, text: string) => void;
  onTranslateSingle: (block: DocumentBlock) => void;
  onOpenPolishSingle: (block: DocumentBlock) => void;
}

export const BlockRow = React.memo<BlockRowProps>(({
  block,
  index,
  viewMode,
  typography,
  theme,
  autoTranslateEnabled = true,
  isBookmarked = false,
  isHighlighted = false,
  onToggleBookmark,
  onUpdateTargetText,
  onTranslateSingle,
  onOpenPolishSingle,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(block.targetText);
  const [copied, setCopied] = useState(false);
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Long press state
  const [showOriginalModal, setShowOriginalModal] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const longPressTimerRef = useRef<any>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);

  // Long press trigger logic (~420ms)
  const handleStartPress = (e: React.TouchEvent | React.MouseEvent) => {
    if ('touches' in e && e.touches[0]) {
      touchStartPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    setIsPressing(true);
    longPressTimerRef.current = setTimeout(() => {
      setShowOriginalModal(true);
      setIsPressing(false);
      try {
        if ('vibrate' in navigator) navigator.vibrate(35);
      } catch (err) {}
    }, 420);
  };

  const handleCancelPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setIsPressing(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartPosRef.current && e.touches[0]) {
      const dx = Math.abs(e.touches[0].clientX - touchStartPosRef.current.x);
      const dy = Math.abs(e.touches[0].clientY - touchStartPosRef.current.y);
      if (dx > 10 || dy > 10) {
        handleCancelPress();
      }
    }
  };

  const handleCopy = () => {
    if (!block.targetText) return;
    navigator.clipboard.writeText(block.targetText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleCopyOriginal = () => {
    if (!block.sourceText) return;
    navigator.clipboard.writeText(block.sourceText);
    setCopiedOriginal(true);
    setTimeout(() => setCopiedOriginal(false), 1500);
  };

  const handleSaveEdit = () => {
    onUpdateTargetText(block.id, editText);
    setIsEditing(false);
  };

  // Font family class
  const fontClass =
    typography.fontFamily === 'serif'
      ? 'font-reading-serif'
      : typography.fontFamily === 'kaiti'
      ? 'font-reading-kaiti'
      : typography.fontFamily === 'mono'
      ? 'font-reading-mono'
      : 'font-reading-sans';

  // Structural tag styles
  const isH1 = block.type === 'h1';
  const isH2 = block.type === 'h2';
  const isH3 = block.type === 'h3';
  const isH4 = block.type === 'h4';
  const isHeading = isH1 || isH2 || isH3 || isH4;
  const isQuote = block.type === 'blockquote';
  const isLi = block.type === 'li';
  const isCode = block.type === 'code';

  const headingSizeClass = isH1
    ? 'text-xl sm:text-2xl font-extrabold tracking-tight'
    : isH2
    ? 'text-lg sm:text-xl font-bold tracking-tight'
    : isH3
    ? 'text-base sm:text-lg font-semibold'
    : isH4
    ? 'text-sm sm:text-base font-semibold'
    : '';

  // Width ratios for split view
  const leftRatio =
    typography.columnRatio === '45-55'
      ? 'w-full lg:w-[45%]'
      : typography.columnRatio === '55-45'
      ? 'w-full lg:w-[55%]'
      : 'w-full lg:w-1/2';

  const rightRatio =
    typography.columnRatio === '45-55'
      ? 'w-full lg:w-[55%]'
      : typography.columnRatio === '55-45'
      ? 'w-full lg:w-[45%]'
      : 'w-full lg:w-1/2';

  return (
    <div
      id={`block-${block.id}`}
      data-block-index={index}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        handleCancelPress();
      }}
      // Long press bindings
      onTouchStart={handleStartPress}
      onTouchEnd={handleCancelPress}
      onTouchMove={handleTouchMove}
      onMouseDown={handleStartPress}
      onMouseUp={handleCancelPress}
      style={{
        marginBottom: `${typography.paragraphSpacing}px`,
      }}
      className={`reader-block-row group relative rounded-xl transition-all duration-300 p-2 sm:p-3 select-text ${
        isPressing ? 'scale-[0.998] bg-red-500/10' : ''
      } ${
        isHighlighted
          ? 'ring-2 ring-amber-500 bg-amber-50/80 dark:bg-amber-950/40 shadow-md scale-[1.008]'
          : typography.highlightActive && isHovered
          ? `${theme.activeRowBg} ring-1 ring-amber-500/30`
          : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
      }`}
    >
      {/* Bookmarked Ribbon/Pill */}
      {isBookmarked && (
        <div className="absolute top-2 right-2 no-print flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-950/80 px-2 py-0.5 rounded-md shadow-2xs z-10 animate-in fade-in">
          <BookmarkIcon className="h-3 w-3 fill-amber-500 text-amber-600" />
          <span className="hidden sm:inline">已收藏</span>
        </div>
      )}

      {/* 1. SPLIT VIEW (左右分栏模式) */}
      {viewMode === 'split' && (
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">
          {/* Left Column: Source Text */}
          <div
            className={`${leftRatio} min-w-0 transition-opacity ${
              typography.sourceDimming ? 'opacity-75 hover:opacity-100' : 'opacity-90'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1 no-print">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${theme.sourceBadge}`}>
                原文 · #{index + 1}
              </span>
            </div>

            <div
              className={`${fontClass} ${headingSizeClass} ${
                isQuote
                  ? 'border-l-3 border-zinc-400 pl-3 italic text-zinc-600 dark:text-zinc-400'
                  : ''
              } ${
                isCode
                  ? 'font-mono text-xs bg-black/5 dark:bg-white/5 p-3 rounded-lg overflow-x-auto'
                  : ''
              }`}
              style={{
                fontSize: isHeading ? undefined : `${typography.fontSize * 0.95}px`,
                lineHeight: typography.lineHeight,
              }}
            >
              {isLi && <span className="mr-1.5 opacity-60">•</span>}
              {block.sourceText}
            </div>
          </div>

          {/* Right Column: Target / Polish Text */}
          <div className={`${rightRatio} min-w-0 relative`}>
            {/* Top row actions & badge */}
            <div className="flex items-center justify-between gap-2 mb-1 no-print">
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${theme.targetBadge}`}>
                  译文
                </span>
                {block.polishHistory && block.polishHistory.length > 0 && (
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center gap-0.5 text-[10px] text-purple-600 dark:text-purple-400 font-medium px-1.5 py-0.5 rounded bg-purple-100/60 dark:bg-purple-950/40"
                    title="查看润色历程"
                  >
                    <Sparkles className="h-2.5 w-2.5" /> 已润色
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                {/* Bookmark Toggle */}
                {onToggleBookmark && (
                  <button
                    onClick={() => onToggleBookmark(block, index)}
                    className={`p-1 rounded transition ${
                      isBookmarked
                        ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/50'
                        : 'text-zinc-400 hover:text-amber-600 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                    title={isBookmarked ? '取消书签' : '添加为书签收藏'}
                  >
                    <BookmarkIcon
                      className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`}
                    />
                  </button>
                )}
                <button
                  onClick={() => setShowOriginalModal(true)}
                  className="p-1 rounded text-zinc-400 hover:text-amber-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition lg:hidden"
                  title="查看英文原文"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onTranslateSingle(block)}
                  disabled={block.isTranslating}
                  className="p-1 rounded text-zinc-400 hover:text-[#990000] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                  title="重新翻译本段"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${block.isTranslating ? 'animate-spin text-[#990000]' : ''}`}
                  />
                </button>
                <button
                  onClick={() => onOpenPolishSingle(block)}
                  disabled={!block.targetText || block.isPolishing}
                  className="p-1 rounded text-zinc-400 hover:text-purple-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                  title="AI润色本段"
                >
                  <Sparkles
                    className={`h-3.5 w-3.5 ${block.isPolishing ? 'animate-pulse text-purple-600' : ''}`}
                  />
                </button>
                <button
                  onClick={() => {
                    setIsEditing(!isEditing);
                    setEditText(block.targetText);
                  }}
                  className="p-1 rounded text-zinc-400 hover:text-blue-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                  title="直接编辑译文"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={handleCopy}
                  className="p-1 rounded text-zinc-400 hover:text-emerald-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                  title="复制译文"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Target text render or inline edit */}
            {isEditing ? (
              <div className="space-y-2 no-print">
                <textarea
                  rows={4}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-amber-500 bg-white dark:bg-zinc-800 focus:outline-none ring-2 ring-amber-500/20"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-2.5 py-1 text-xs text-zinc-500 hover:text-zinc-800"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1 text-xs font-semibold rounded-lg bg-[#990000] text-white"
                  >
                    保存编辑
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => {
                  if (!block.targetText) onTranslateSingle(block);
                }}
                className={`${fontClass} ${headingSizeClass} ${
                  isQuote ? 'border-l-3 border-[#990000] pl-3 italic' : ''
                } ${
                  isCode
                    ? 'font-mono text-xs bg-black/5 dark:bg-white/5 p-3 rounded-lg overflow-x-auto'
                    : ''
                } ${!block.targetText ? 'text-zinc-400 italic cursor-pointer hover:text-[#990000]' : ''}`}
                style={{
                  fontSize: isHeading ? undefined : `${typography.fontSize}px`,
                  lineHeight: typography.lineHeight,
                }}
              >
                {isLi && <span className="mr-1.5 opacity-60">•</span>}
                {block.targetText || (block.isTranslating ? (
                  <span className="text-[#990000] inline-flex items-center gap-1 text-xs animate-pulse">
                    <RefreshCw className="h-3 w-3 animate-spin" /> 正在智能伴读翻译中...
                  </span>
                ) : autoTranslateEnabled ? (
                  <span className="text-amber-700 dark:text-amber-400 text-xs not-italic inline-flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    <span>伴读排队中... (点击优先翻译)</span>
                  </span>
                ) : (
                  '点击即可翻译此段落'
                ))}
              </div>
            )}

            {/* Polish History Dropdown */}
            {showHistory && block.polishHistory && block.polishHistory.length > 0 && (
              <div className="mt-2 p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-xs text-purple-900 dark:text-purple-200 no-print space-y-1">
                <div className="font-semibold flex items-center gap-1 text-[11px]">
                  <History className="h-3 w-3" /> 最近一次润色解释：
                </div>
                <div className="text-[11px] opacity-90">
                  {block.polishHistory[block.polishHistory.length - 1].explanation}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. INTERLINEAR VIEW (上下逐段交替对照) */}
      {viewMode === 'interlinear' && (
        <div className="space-y-2">
          {/* Source paragraph (Upper, muted) */}
          <div
            className={`${fontClass} opacity-70 ${
              isQuote ? 'border-l-2 border-zinc-400 pl-3 italic' : ''
            }`}
            style={{
              fontSize: isHeading ? undefined : `${typography.fontSize * 0.9}px`,
              lineHeight: 1.5,
            }}
          >
            {isLi && <span className="mr-1">•</span>}
            {block.sourceText}
          </div>

          {/* Target paragraph (Lower, prominent) */}
          <div className="relative pl-1">
            <div
              className={`${fontClass} ${headingSizeClass} ${
                isQuote ? 'border-l-3 border-[#990000] pl-3 font-medium' : ''
              } ${!block.targetText ? 'text-zinc-400 italic' : ''}`}
              style={{
                fontSize: isHeading ? undefined : `${typography.fontSize}px`,
                lineHeight: typography.lineHeight,
              }}
            >
              {isLi && <span className="mr-1">•</span>}
              {block.targetText || (block.isTranslating ? (
                <span className="text-[#990000] inline-flex items-center gap-1 text-xs animate-pulse font-normal">
                  <RefreshCw className="h-3 w-3 animate-spin" /> 正在智能伴读翻译中...
                </span>
              ) : autoTranslateEnabled ? (
                <span
                  onClick={() => onTranslateSingle(block)}
                  className="text-amber-700 dark:text-amber-400 text-xs not-italic cursor-pointer hover:underline inline-flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  <span>伴读排队中... (点击优先翻译)</span>
                </span>
              ) : (
                <span
                  onClick={() => onTranslateSingle(block)}
                  className="text-zinc-400 text-xs italic cursor-pointer hover:underline"
                >
                  （尚未翻译，点击此处立即翻译）
                </span>
              ))}
            </div>

            {/* Quick mini toolbar */}
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-zinc-400 no-print opacity-0 group-hover:opacity-100 transition">
              {onToggleBookmark && (
                <>
                  <button
                    onClick={() => onToggleBookmark(block, index)}
                    className={`flex items-center gap-0.5 transition ${
                      isBookmarked
                        ? 'text-amber-600 font-bold'
                        : 'hover:text-amber-600'
                    }`}
                  >
                    <BookmarkIcon
                      className={`h-3 w-3 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`}
                    />
                    <span>{isBookmarked ? '已书签' : '书签'}</span>
                  </button>
                  <span>·</span>
                </>
              )}
              <button
                onClick={() => setShowOriginalModal(true)}
                className="hover:text-[#990000] flex items-center gap-0.5"
              >
                <Eye className="h-3 w-3" /> 原文
              </button>
              <span>·</span>
              <button
                onClick={() => onTranslateSingle(block)}
                className="hover:text-[#990000] flex items-center gap-0.5"
              >
                <RefreshCw className="h-3 w-3" /> 重译
              </button>
              <span>·</span>
              <button
                onClick={() => onOpenPolishSingle(block)}
                className="hover:text-purple-600 flex items-center gap-0.5"
              >
                <Sparkles className="h-3 w-3" /> 润色
              </button>
              <span>·</span>
              <button onClick={handleCopy} className="hover:text-emerald-600">
                复制
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. TARGET ONLY (纯译文模式) */}
      {viewMode === 'target-only' && (
        <div
          className={`${fontClass} ${headingSizeClass} ${
            isQuote ? 'border-l-3 border-[#990000] pl-3' : ''
          }`}
          style={{
            fontSize: isHeading ? undefined : `${typography.fontSize}px`,
            lineHeight: typography.lineHeight,
          }}
        >
          {isLi && <span className="mr-1.5">•</span>}
          {block.targetText ? (
            <span className="relative">
              {block.targetText}
              {/* Subtle hover actions on desktop */}
              <span className="inline-flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition no-print text-[11px]">
                {onToggleBookmark && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleBookmark(block, index);
                    }}
                    className={`p-1 transition rounded ${
                      isBookmarked
                        ? 'text-amber-600'
                        : 'text-zinc-400 hover:text-amber-600'
                    }`}
                    title={isBookmarked ? '取消书签' : '书签收藏本段'}
                  >
                    <BookmarkIcon
                      className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`}
                    />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowOriginalModal(true);
                  }}
                  className="p-1 text-zinc-400 hover:text-[#990000] transition"
                  title="长按段落或点击查看英文原文"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
              </span>
            </span>
          ) : block.isTranslating ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-[#990000] dark:text-red-400 py-1 px-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 animate-pulse font-medium">
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span>正在智能伴读翻译本段...</span>
            </span>
          ) : autoTranslateEnabled ? (
            <span
              onClick={() => onTranslateSingle(block)}
              className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50/90 dark:bg-amber-950/50 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800/60 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/50 transition inline-flex items-center gap-1.5 shadow-2xs group"
              title="伴读流正在自动翻译中，也可点击立即优先翻译此段"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
              <span>伴读流排队中，即将自动译出</span>
              <span className="text-[11px] underline opacity-75 group-hover:opacity-100 font-semibold">（点击优先翻译）</span>
            </span>
          ) : (
            <span
              onClick={() => onTranslateSingle(block)}
              className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-900 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/50 transition inline-flex items-center gap-1"
            >
              <span>（本段尚未翻译，点击此处立即翻译）</span>
            </span>
          )}
        </div>
      )}

      {/* 4. SOURCE ONLY (纯原文模式) */}
      {viewMode === 'source-only' && (
        <div
          className={`${fontClass} ${headingSizeClass} ${
            isQuote ? 'border-l-3 border-zinc-400 pl-3' : ''
          }`}
          style={{
            fontSize: isHeading ? undefined : `${typography.fontSize}px`,
            lineHeight: typography.lineHeight,
          }}
        >
          {isLi && <span className="mr-1.5">•</span>}
          {block.sourceText}
        </div>
      )}

      {/* 🌟 LONG-PRESS POPUP MODAL (长按显示的原文浮窗) */}
      {showOriginalModal && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#990000]/10 text-[#990000]">
                  <BookOpen className="h-4 w-4" />
                </span>
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  原文对照 · 第 {index + 1} 段
                </span>
              </div>
              <button
                onClick={() => setShowOriginalModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Source Content */}
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 font-reading-serif select-text max-h-60 overflow-y-auto">
              {block.sourceText}
            </div>

            {/* Current translation snippet */}
            {block.targetText && (
              <div className="p-3 rounded-xl bg-red-50/30 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 text-xs text-zinc-600 dark:text-zinc-400">
                <div className="text-[10px] font-bold text-[#990000] uppercase mb-1">当前对应中文译文：</div>
                <div className="line-clamp-3 leading-relaxed">{block.targetText}</div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 text-xs flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopyOriginal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  {copiedOriginal ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedOriginal ? '已复制原文' : '复制原文'}</span>
                </button>

                {onToggleBookmark && (
                  <button
                    onClick={() => onToggleBookmark(block, index)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition ${
                      isBookmarked
                        ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-medium'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <BookmarkIcon
                      className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`}
                    />
                    <span>{isBookmarked ? '已收藏' : '加书签'}</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowOriginalModal(false);
                    onOpenPolishSingle(block);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>AI润色本段</span>
                </button>

                <button
                  onClick={() => setShowOriginalModal(false)}
                  className="px-4 py-1.5 rounded-lg bg-[#990000] hover:bg-[#800000] text-white font-medium transition"
                >
                  继续阅读
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
