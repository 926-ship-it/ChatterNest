import React, { useState } from 'react';
import {
  Upload,
  Sparkles,
  Palette,
  Sliders,
  Download,
  Languages,
  RefreshCw,
  Columns,
  AlignJustify,
  FileCheck,
  MoreVertical,
  X,
  BookOpen,
  Bookmark as BookmarkIcon,
  Library,
} from 'lucide-react';
import { ViewMode, DocumentMeta } from '../types/document';
import { WinkingBirdIcon } from './WinkingBirdIcon';


interface NavbarProps {
  meta: DocumentMeta;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  bookshelfCount: number;
  onOpenBookshelf: () => void;
  bookmarkCount: number;
  onOpenBookmarks: () => void;
  onOpenImport: () => void;
  onOpenStyle: () => void;
  onOpenPrompt: () => void;
  onOpenExport: () => void;
  onOpenPolishAll: () => void;
  onTranslateAll: () => void;
  isTranslating: boolean;
  translatedCount: number;
  totalCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  meta,
  viewMode,
  setViewMode,
  bookshelfCount,
  onOpenBookshelf,
  bookmarkCount,
  onOpenBookmarks,
  onOpenImport,
  onOpenStyle,
  onOpenPrompt,
  onOpenExport,
  onOpenPolishAll,
  onTranslateAll,
  isTranslating,
  translatedCount,
  totalCount,
}) => {

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const percent = totalCount > 0 ? Math.round((translatedCount / totalCount) * 100) : 0;

  return (
    <header className="no-print sticky top-0 z-40 w-full border-b border-black/10 bg-white/95 backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/95 transition-colors">
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-6">
        {/* Left: Brand & Document Info (Single-line, zero overlap on any mobile screen) */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
          <div
            onClick={onOpenBookshelf}
            className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#990000] via-[#c23b3b] to-amber-600 text-white shadow-xs cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            title="ChatterNest · 点击进入本地书架"
          >
            <WinkingBirdIcon className="h-5 w-5 sm:h-6 sm:w-6 drop-shadow-xs" />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span
              onClick={onOpenBookshelf}
              className="font-black text-sm sm:text-base tracking-tight text-zinc-900 dark:text-zinc-100 whitespace-nowrap cursor-pointer hover:text-[#990000] transition-colors"
              title="ChatterNest · 故事双语伴读工作台"
            >
              ChatterNest
            </span>

            {/* Compact percent badge on mobile */}
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
              {percent}%
            </span>
            {/* Sub-badge and block count on sm+ only to prevent mobile cramping */}
            <span className="hidden sm:inline-flex text-[10px] sm:text-xs px-1.5 py-0.5 rounded-sm font-bold bg-[#990000]/10 text-[#990000] whitespace-nowrap">
              双语伴读
            </span>
            <span className="hidden md:inline text-xs text-zinc-400 font-mono whitespace-nowrap">
              ({translatedCount}/{totalCount}段)
            </span>
            {isTranslating && (
              <span className="flex items-center gap-1 text-[#990000] text-[10px] font-medium animate-pulse whitespace-nowrap">
                <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                <span className="hidden sm:inline">翻译中</span>
              </span>
            )}
          </div>
        </div>

        {/* Center: Desktop View Mode Switcher */}
        <div className="hidden lg:flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-300">
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md transition ${
              viewMode === 'split'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs font-semibold'
                : 'hover:text-zinc-900 dark:hover:text-white'
            }`}
            title="左右双栏分栏对照"
          >
            <Columns className="h-3.5 w-3.5" />
            <span>左右分栏</span>
          </button>
          <button
            onClick={() => setViewMode('interlinear')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md transition ${
              viewMode === 'interlinear'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs font-semibold'
                : 'hover:text-zinc-900 dark:hover:text-white'
            }`}
            title="上下段落逐段对照"
          >
            <AlignJustify className="h-3.5 w-3.5" />
            <span>上下逐段</span>
          </button>
          <button
            onClick={() => setViewMode('target-only')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md transition ${
              viewMode === 'target-only'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs font-semibold'
                : 'hover:text-zinc-900 dark:hover:text-white'
            }`}
            title="仅看中文译文"
          >
            <FileCheck className="h-3.5 w-3.5" />
            <span>纯译文</span>
          </button>
        </div>

        {/* Right: Actions Container */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-auto">
          {/* Quick Import */}
          <button
            onClick={onOpenImport}
            className="flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 sm:px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 shadow-xs transition shrink-0"
            title="导入 HTML 或 PDF"
          >
            <Upload className="h-3.5 w-3.5 text-zinc-500" />
            <span className="hidden sm:inline">导入故事</span>
            <span className="sm:hidden text-xs">导入</span>
          </button>

          {/* Desktop-Only Action Buttons */}
          <div className="hidden md:flex items-center gap-1.5 sm:gap-2">
            {/* Bookshelf Drawer Button */}
            <button
              onClick={onOpenBookshelf}
              className="flex items-center gap-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50/80 dark:bg-amber-950/40 px-2.5 py-1.5 text-xs font-semibold text-amber-900 dark:text-amber-200 hover:bg-amber-100 shadow-xs transition"
              title="打开我的本地书架（100% 本地存储）"
            >
              <Library className="h-3.5 w-3.5 text-[#990000] dark:text-amber-400" />
              <span>书架</span>
              {bookshelfCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#990000] text-white font-mono">
                  {bookshelfCount}
                </span>
              )}
            </button>

            {/* Bookmarks Drawer Button */}
            <button
              onClick={onOpenBookmarks}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium shadow-xs transition ${
                bookmarkCount > 0
                  ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200'
                  : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700'
              }`}
              title="查看已保存的故事书签与段落收藏"
            >
              <BookmarkIcon
                className={`h-3.5 w-3.5 ${
                  bookmarkCount > 0
                    ? 'fill-amber-500 text-amber-600'
                    : 'text-amber-600'
                }`}
              />
              <span>书签</span>
              {bookmarkCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white font-mono">
                  {bookmarkCount}
                </span>
              )}
            </button>

            {/* Style */}
            <button
              onClick={onOpenStyle}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 shadow-xs transition"
              title="自定义背景底色与字体"
            >
              <Palette className="h-3.5 w-3.5 text-amber-600" />
              <span>排版外观</span>
            </button>

            {/* Prompt Preferences */}
            <button
              onClick={onOpenPrompt}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 shadow-xs transition"
              title="配置同人提示词模板与术语表"
            >
              <Sliders className="h-3.5 w-3.5 text-indigo-600" />
              <span>提示词偏好</span>
            </button>

            {/* AI Polish */}
            <button
              onClick={onOpenPolishAll}
              className="flex items-center gap-1.5 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1.5 text-xs font-medium text-purple-700 dark:text-purple-300 hover:bg-purple-100 shadow-xs transition"
              title="AI润色，消除翻译腔，提升文采与张力"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-600" />
              <span>AI润色</span>
            </button>

            {/* Translate All */}
            <button
              onClick={onTranslateAll}
              disabled={isTranslating}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition ${
                isTranslating
                  ? 'bg-amber-400 cursor-not-allowed'
                  : 'bg-[#990000] hover:bg-[#800000] active:scale-95'
              }`}
              title="全篇批量翻译"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isTranslating ? 'animate-spin' : ''}`} />
              <span>{isTranslating ? '翻译中...' : '全篇翻译'}</span>
            </button>

            {/* Export */}
            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-white dark:text-zinc-900 hover:bg-zinc-800 active:scale-95 shadow-xs transition"
              title="导出为 Word 或 PDF"
            >
              <Download className="h-3.5 w-3.5" />
              <span>导出</span>
            </button>
          </div>

          {/* Mobile Quick Bookshelf Button */}
          <button
            onClick={onOpenBookshelf}
            className="md:hidden flex items-center gap-1 px-2 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs font-bold shadow-xs transition shrink-0"
            title="打开本地书架"
          >
            <Library className="h-3.5 w-3.5 text-[#990000]" />
            <span className="text-[10px] font-mono px-1 rounded-full bg-[#990000] text-white font-bold">
              {bookshelfCount}
            </span>
          </button>

          {/* Mobile View Mode Quick Switch Button (One-tap between Bilingual and Target-Only) */}
          <button
            onClick={() => setViewMode(viewMode === 'target-only' ? 'interlinear' : 'target-only')}
            className={`md:hidden flex items-center gap-1 px-2 py-1.5 rounded-lg border text-xs font-bold shadow-xs transition shrink-0 ${
              viewMode === 'target-only'
                ? 'border-[#990000] bg-[#990000] text-white ring-2 ring-[#990000]/20'
                : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:border-zinc-300'
            }`}
            title="手机端一键切换：双语对照 ↔ 全篇纯译文"
          >
            <FileCheck className="h-3.5 w-3.5" />
            <span>{viewMode === 'target-only' ? '纯译文' : '全译文'}</span>
          </button>

          {/* Mobile Overflow Menu Toggle */}
          <div className="relative md:hidden shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 relative"
              title="更多功能"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <MoreVertical className="h-4 w-4" />}
              {bookmarkCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white dark:ring-zinc-900" />
              )}
            </button>

            {/* Mobile Dropdown Popover */}
            {mobileMenuOpen && (
              <div
                onClick={() => setMobileMenuOpen(false)}
                className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl p-2 z-50 animate-in fade-in space-y-1"
              >
                {/* Bookshelf Option */}
                <button
                  onClick={onOpenBookshelf}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-100/70 dark:bg-amber-950/60 rounded-lg text-left"
                >
                  <span className="flex items-center gap-2">
                    <Library className="h-4 w-4 text-[#990000]" />
                    <span>我的本地书架</span>
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#990000] text-white font-mono">
                    {bookshelfCount} 部
                  </span>
                </button>

                {/* Bookmarks Option */}
                <button
                  onClick={onOpenBookmarks}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 rounded-lg text-left"
                >
                  <span className="flex items-center gap-2">
                    <BookmarkIcon className="h-4 w-4 fill-amber-500 text-amber-600" />
                    <span>故事书签与收藏</span>
                  </span>
                  {bookmarkCount > 0 ? (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white font-mono">
                      {bookmarkCount}
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-400">0</span>
                  )}
                </button>


                {/* View Mode Switching Options */}
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 mb-1 pt-1">
                  阅读显示模式
                </div>
                <button
                  onClick={() => setViewMode('target-only')}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg text-left transition ${
                    viewMode === 'target-only'
                      ? 'bg-[#990000]/10 text-[#990000] dark:bg-[#990000]/20'
                      : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-[#990000]" />
                    <span>纯译文 (全篇中文)</span>
                  </span>
                  {viewMode === 'target-only' && <span className="text-[10px] text-[#990000]">当前</span>}
                </button>
                <button
                  onClick={() => setViewMode('interlinear')}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg text-left transition ${
                    viewMode === 'interlinear'
                      ? 'bg-[#990000]/10 text-[#990000] dark:bg-[#990000]/20'
                      : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <AlignJustify className="h-4 w-4 text-zinc-500" />
                    <span>上下逐段对照</span>
                  </span>
                  {viewMode === 'interlinear' && <span className="text-[10px] text-[#990000]">当前</span>}
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg text-left transition ${
                    viewMode === 'split'
                      ? 'bg-[#990000]/10 text-[#990000] dark:bg-[#990000]/20'
                      : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Columns className="h-4 w-4 text-zinc-500" />
                    <span>左右分栏对照</span>
                  </span>
                  {viewMode === 'split' && <span className="text-[10px] text-[#990000]">当前</span>}
                </button>

                <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />

                <button
                  onClick={onOpenStyle}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-left"
                >
                  <Palette className="h-4 w-4 text-amber-600" />
                  <span>排版外观与底色</span>
                </button>
                <button
                  onClick={onOpenPrompt}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-left"
                >
                  <Sliders className="h-4 w-4 text-indigo-600" />
                  <span>提示词与术语表</span>
                </button>
                <button
                  onClick={onOpenPolishAll}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg text-left"
                >
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span>AI 全篇智能润色</span>
                </button>
                <button
                  onClick={onTranslateAll}
                  disabled={isTranslating}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#990000] hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg text-left"
                >
                  <RefreshCw className={`h-4 w-4 ${isTranslating ? 'animate-spin' : ''}`} />
                  <span>{isTranslating ? '翻译中...' : '一键全篇翻译'}</span>
                </button>
                <button
                  onClick={onOpenExport}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-left border-t border-zinc-100 dark:border-zinc-800 pt-2"
                >
                  <Download className="h-4 w-4" />
                  <span>导出 Word / PDF</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Line */}
      {totalCount > 0 && (
        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-0.5 sm:h-1">
          <div
            className="bg-gradient-to-r from-[#990000] via-[#c23b3b] to-amber-500 h-full transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </header>
  );
};
