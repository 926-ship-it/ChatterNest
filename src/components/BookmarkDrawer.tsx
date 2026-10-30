import React, { useState } from 'react';
import {
  Bookmark as BookmarkIcon,
  X,
  ArrowRight,
  Trash2,
  Edit2,
  Check,
  Search,
  Copy,
  Clock,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { Bookmark, DocumentMeta } from '../types/document';

interface BookmarkDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: Bookmark[];
  meta: DocumentMeta;
  onJumpToBlock: (blockId: string) => void;
  onDeleteBookmark: (id: string) => void;
  onUpdateBookmarkNote: (id: string, note: string) => void;
  onClearAllBookmarks: () => void;
}

export const BookmarkDrawer: React.FC<BookmarkDrawerProps> = ({
  isOpen,
  onClose,
  bookmarks,
  meta,
  onJumpToBlock,
  onDeleteBookmark,
  onUpdateBookmarkNote,
  onClearAllBookmarks,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'order' | 'time'>('order');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter and sort
  const filtered = bookmarks.filter(
    (b) =>
      b.previewText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.sourcePreview.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.note && b.note.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'order') return a.blockIndex - b.blockIndex;
    return b.createdAt - a.createdAt;
  });

  const handleStartEditNote = (bookmark: Bookmark) => {
    setEditingNoteId(bookmark.id);
    setNoteDraft(bookmark.note || '');
  };

  const handleSaveNote = (id: string) => {
    onUpdateBookmarkNote(id, noteDraft);
    setEditingNoteId(null);
  };

  const handleCopyQuote = (b: Bookmark) => {
    const text = `【${meta.title} · 第 ${b.blockIndex + 1} 段】\n${b.previewText}\n(原文: ${b.sourcePreview})`;
    navigator.clipboard.writeText(text);
    setCopiedId(b.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div
      onClick={onClose}
      className="no-print fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md h-full bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <BookmarkIcon className="h-5 w-5 fill-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                  段落书签与收藏
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold font-mono">
                  {bookmarks.length}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate max-w-[240px]">
                {meta.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Controls: Search and Sort */}
        <div className="p-3 sm:px-5 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col gap-2 shrink-0">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              placeholder="搜索书签内容或个人批注..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-1">
              <span className="text-[11px]">排序:</span>
              <button
                onClick={() => setSortBy('order')}
                className={`px-2 py-0.5 rounded text-[11px] transition ${
                  sortBy === 'order'
                    ? 'bg-white dark:bg-zinc-800 font-bold text-zinc-900 dark:text-white shadow-2xs'
                    : 'text-zinc-400 hover:text-zinc-700'
                }`}
              >
                文章顺序
              </button>
              <button
                onClick={() => setSortBy('time')}
                className={`px-2 py-0.5 rounded text-[11px] transition ${
                  sortBy === 'time'
                    ? 'bg-white dark:bg-zinc-800 font-bold text-zinc-900 dark:text-white shadow-2xs'
                    : 'text-zinc-400 hover:text-zinc-700'
                }`}
              >
                最新添加
              </button>
            </div>

            {bookmarks.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('确定要清空本文档的所有书签吗？')) {
                    onClearAllBookmarks();
                  }
                }}
                className="text-[11px] text-zinc-400 hover:text-red-600 transition flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" />
                <span>清空</span>
              </button>
            )}
          </div>
        </div>

        {/* Bookmarks List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3">
          {sorted.length === 0 ? (
            <div className="py-16 text-center space-y-3 px-4">
              <div className="p-3 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 w-12 h-12 mx-auto flex items-center justify-center">
                <BookmarkIcon className="h-6 w-6 stroke-1" />
              </div>
              <h4 className="font-bold text-sm text-zinc-700 dark:text-zinc-300">
                {searchQuery ? '没有找到匹配的书签' : '当前暂无书签'}
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
                {searchQuery
                  ? '换个关键词试试，或清空搜索框'
                  : '阅读时点击段落右侧的 🔖 图标，或长按任意段落，即可将触动你的金句或段落收藏到这里！'}
              </p>
            </div>
          ) : (
            sorted.map((b) => (
              <div
                key={b.id}
                className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-800/70 hover:border-amber-500/40 shadow-xs transition space-y-2.5 group"
              >
                {/* Item Top Row */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-[#990000]/10 text-[#990000] font-bold text-[11px]">
                      第 {b.blockIndex + 1} 段
                    </span>
                    <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {new Date(b.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyQuote(b)}
                      className="p-1 rounded text-zinc-400 hover:text-emerald-600 transition"
                      title="复制本段中英对照金句"
                    >
                      {copiedId === b.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => onDeleteBookmark(b.id)}
                      className="p-1 rounded text-zinc-400 hover:text-red-600 transition"
                      title="删除书签"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Excerpt Target Text */}
                <div className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-reading-sans line-clamp-3">
                  {b.previewText || b.sourcePreview}
                </div>

                {/* Excerpt Source Text (Muted preview) */}
                <div className="text-[11px] text-zinc-400 dark:text-zinc-500 italic line-clamp-2 border-l-2 border-zinc-200 dark:border-zinc-700 pl-2">
                  {b.sourcePreview}
                </div>

                {/* Note Area */}
                {editingNoteId === b.id ? (
                  <div className="pt-1 space-y-1.5">
                    <input
                      type="text"
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      placeholder="写下你的阅读笔记或名场面标签..."
                      className="w-full px-2.5 py-1 text-xs rounded-md border border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20 text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                      autoFocus
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setEditingNoteId(null)}
                        className="px-2 py-0.5 text-[11px] text-zinc-500 hover:text-zinc-700"
                      >
                        取消
                      </button>
                      <button
                        onClick={() => handleSaveNote(b.id)}
                        className="px-2.5 py-0.5 text-[11px] bg-amber-600 hover:bg-amber-700 text-white rounded font-medium"
                      >
                        保存
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    {b.note ? (
                      <div
                        onClick={() => handleStartEditNote(b)}
                        className="text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded cursor-pointer hover:underline truncate max-w-[200px]"
                        title="点击修改笔记"
                      >
                        📝 {b.note}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartEditNote(b)}
                        className="text-zinc-400 hover:text-amber-600 transition flex items-center gap-1"
                      >
                        <Edit2 className="h-2.5 w-2.5" />
                        <span>添加笔记</span>
                      </button>
                    )}

                    {/* Jump to Block Button */}
                    <button
                      onClick={() => {
                        onJumpToBlock(b.blockId);
                        onClose();
                      }}
                      className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 font-semibold text-[11px] shadow-xs active:scale-95 transition"
                    >
                      <span>直达本段</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer Tip */}
        <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 text-center text-[11px] text-zinc-400 bg-zinc-50 dark:bg-zinc-900 shrink-0">
          💡 点击「直达本段」即可平滑滚动定位并高亮闪烁提示
        </div>
      </div>
    </div>
  );
};
