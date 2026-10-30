import React, { useState, useRef, useMemo } from 'react';
import {
  X,
  BookOpen,
  Library,
  HardDrive,
  ShieldAlert,
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  FileText,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Bookmark as BookmarkIcon,
  Plus,
  RefreshCw,
  AlertTriangle,
  FolderDown,
  FolderUp,
  Share2,
} from 'lucide-react';
import { BookshelfStory } from '../types/document';
import { calculateStoryStats, formatReadingTime } from '../utils/readingTime';
import { WinkingBirdIcon } from './WinkingBirdIcon';

interface BookshelfDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookshelf: BookshelfStory[];
  currentStoryId: string;
  onSelectStory: (storyId: string) => void;
  onSaveCurrentStory: () => void;
  onDeleteStory: (storyId: string) => void;
  onImportNewStory: () => void;
  onRestoreBackup: (importedStories: BookshelfStory[]) => void;
}

export const BookshelfDrawer: React.FC<BookshelfDrawerProps> = ({
  isOpen,
  onClose,
  bookshelf,
  currentStoryId,
  onSelectStory,
  onSaveCurrentStory,
  onDeleteStory,
  onImportNewStory,
  onRestoreBackup,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'reading' | 'completed' | 'in_progress'>('all');
  const [showFullDisclaimer, setShowFullDisclaimer] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Storage usage estimation
  const storageUsageKB = useMemo(() => {
    try {
      const serialized = JSON.stringify(bookshelf);
      return Math.round((new Blob([serialized]).size / 1024) * 10) / 10;
    } catch {
      return 0;
    }
  }, [bookshelf]);

  // Overall bookshelf reading statistics
  const { totalShelfWords, totalShelfMinutes } = useMemo(() => {
    let words = 0;
    for (const story of bookshelf) {
      const stats = calculateStoryStats(
        story.blocks,
        story.estimatedWords || story.ao3Meta?.stats?.words
      );
      words += stats.wordCount;
    }
    const mins = Math.max(1, Math.round(words / 220));
    return { totalShelfWords: words, totalShelfMinutes: mins };
  }, [bookshelf]);

  // Extract distinct fandoms & authors for 1-click filter chips
  const quickFilterChips = useMemo(() => {
    const fandomSet = new Set<string>();
    const authorSet = new Set<string>();

    bookshelf.forEach((s) => {
      s.fandoms?.forEach((f) => {
        if (f.trim()) fandomSet.add(f.trim());
      });
      s.ao3Meta?.fandoms?.forEach((f) => {
        if (f.trim()) fandomSet.add(f.trim());
      });
      if (s.author) {
        const shortName = s.author.split('(')[0].trim() || s.author;
        authorSet.add(shortName);
      }
    });

    return {
      fandoms: Array.from(fandomSet).slice(0, 5),
      authors: Array.from(authorSet).slice(0, 4),
    };
  }, [bookshelf]);

  // Filtered stories with multi-field search (title, author, or fandom name)
  const filteredStories = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const terms = query ? query.split(/\s+/).filter(Boolean) : [];

    return bookshelf.filter((story) => {
      // Filter by tab
      const isCurrent = story.id === currentStoryId;
      const isCompleted = story.totalBlocks > 0 && story.translatedBlocks >= story.totalBlocks;

      if (filterTab === 'reading' && !isCurrent) return false;
      if (filterTab === 'completed' && !isCompleted) return false;
      if (filterTab === 'in_progress' && isCompleted) return false;

      // Filter by search query (checks title, author, fandom, and tags)
      if (terms.length > 0) {
        const titleText = (story.title || '').toLowerCase();
        const authorText = (story.author || story.ao3Meta?.author || '').toLowerCase();
        const fandomText = [
          ...(story.fandoms || []),
          ...(story.ao3Meta?.fandoms || []),
          ...(story.ao3Meta?.additionalTags || []),
          ...(story.ao3Meta?.characters || []),
        ]
          .map((f) => f.toLowerCase())
          .join(' ');

        // Every term must be found in at least one of title, author, or fandom
        const matchesAllTerms = terms.every(
          (t) => titleText.includes(t) || authorText.includes(t) || fandomText.includes(t)
        );

        if (!matchesAllTerms) return false;
      }

      return true;
    });
  }, [bookshelf, currentStoryId, filterTab, searchQuery]);


  // Backup entire shelf to JSON file
  const handleExportBackup = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bookshelf, null, 2));
      const downloadAnchor = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `chatternest_bookshelf_backup_${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error('Backup error:', err);
      alert('导出备份出现异常，请稍后重试');
    }
  };

  // Restore backup from JSON file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id && parsed[0].blocks) {
          onRestoreBackup(parsed as BookshelfStory[]);
          alert(`成功恢复 ${parsed.length} 部作品到您的本地书架！`);
        } else {
          alert('备份文件格式不正确，请选择有效的 ChatterNest 书架备份 JSON 文件。');
        }
      } catch (err) {
        console.error('Failed to parse backup JSON:', err);
        alert('解析备份文件失败，请确保文件内容为有效的 JSON 格式。');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="flex flex-col w-full max-w-4xl max-h-[92vh] rounded-2xl bg-[#FAF8F5] dark:bg-zinc-900 border border-amber-900/10 dark:border-zinc-800 shadow-2xl overflow-hidden text-zinc-900 dark:text-zinc-100">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-amber-900/10 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#990000] to-amber-700 text-white shadow-sm ring-1 ring-amber-500/20">
              <WinkingBirdIcon className="h-6 w-6 drop-shadow-xs" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <span>我的本地书架</span>
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#990000]/10 text-[#990000] dark:bg-[#990000]/20 font-mono">
                  {bookshelf.length} 部作品
                </span>
                <span className="hidden sm:inline-flex text-[11px] px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200/60 dark:border-amber-800/60 font-medium items-center gap-1">
                  <Clock className="h-3 w-3 text-amber-600" />
                  <span>总字数约 {totalShelfWords.toLocaleString()} 词 · 预计读完需 {formatReadingTime(totalShelfMinutes)}</span>
                </span>
                <span className="hidden md:inline-flex text-[11px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-mono">
                  本地占用: {storageUsageKB} KB
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                纯本地无损保存 · 即开即读 · 离线私密
              </p>

            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              title="关闭书架"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* PROMINENT PRIVACY & LOCAL STORAGE DISCLAIMER BANNER (As specifically requested by user) */}
        <div className="border-b border-amber-200 dark:border-amber-900/40 bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-amber-50/90 dark:from-amber-950/30 dark:via-zinc-900 dark:to-amber-950/30 px-4 sm:px-6 py-3 transition-all">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black tracking-wide text-amber-900 dark:text-amber-200 uppercase">
                    重要免责声明：100% 本地存储 · 网站不承担任何数据存储责任
                  </span>
                </div>
                <button
                  onClick={() => setShowFullDisclaimer(!showFullDisclaimer)}
                  className="flex items-center gap-0.5 text-xs text-amber-800 dark:text-amber-300 hover:underline font-medium shrink-0"
                >
                  <span>{showFullDisclaimer ? '收起详情' : '阅读完整说明'}</span>
                  {showFullDisclaimer ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
              </div>

              <p className="text-xs text-amber-900/80 dark:text-amber-300/80 mt-0.5 leading-relaxed">
                ChatterNest 为纯客户端本地工具。您的所有作品文档、双语译文、个人书签均{' '}
                <strong className="text-amber-950 dark:text-amber-100 font-bold underline decoration-amber-400">
                  保存在您当前设备的浏览器中
                </strong>
                。网站服务器不保存、无法读取亦不承担任何云端数据存储责任；清理浏览器缓存或更换设备会导致数据丢失，请务必善用「备份书架」！
              </p>

              {/* Expandable detailed guidance */}
              {showFullDisclaimer && (
                <div className="mt-3 pt-3 border-t border-amber-200/60 dark:border-amber-900/50 text-[11px] text-amber-950/80 dark:text-amber-200/90 space-y-1.5 leading-normal animate-in fade-in">
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-[#990000] shrink-0">1. 数据归属：</span>
                    <span>所有同人作品、文学名篇、AI润色记录与段落批注均由您的浏览器 LocalStorage 本地管理，网站绝不上报服务器。</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-[#990000] shrink-0">2. 存储免责：</span>
                    <span>因用户自发清理浏览器历史与缓存（Clear Cache）、无痕模式关闭页面、操作系统重装或设备故障导致的数据丢失，本站无权且无法提供云端恢复，概不承担任何责任。</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-[#990000] shrink-0">3. 安全建议：</span>
                    <span>请定期点击右侧「备份书架 (JSON)」按钮将作品库保存至本地硬盘，或导出为 Word / PDF 文档永久留存。</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Search Bar & Filters Section */}
        <div className="p-3.5 sm:p-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 space-y-3">
          {/* Prominent Full-Width Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索书架作品：按标题 (Title)、作者 (Author)、原作/同人分类 (Fandom)..."
              className="w-full pl-10 pr-9 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/80 dark:bg-zinc-800/80 text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-[#990000]/25 focus:border-[#990000] focus:outline-none transition shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60 transition"
                title="清空搜索"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Quick Filter Chips (Authors & Fandoms) */}
          {(quickFilterChips.fandoms.length > 0 || quickFilterChips.authors.length > 0) && (
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium mr-1">快捷筛选:</span>
              {quickFilterChips.fandoms.map((fandom) => {
                const isActive = searchQuery.toLowerCase().includes(fandom.toLowerCase());
                return (
                  <button
                    key={`fandom-${fandom}`}
                    onClick={() => {
                      if (isActive) {
                        setSearchQuery('');
                      } else {
                        setSearchQuery(fandom);
                      }
                    }}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] transition ${
                      isActive
                        ? 'bg-[#990000] text-white font-semibold shadow-2xs'
                        : 'bg-amber-100/70 hover:bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200 dark:hover:bg-amber-900/60 border border-amber-300/40'
                    }`}
                  >
                    <span>{fandom}</span>
                  </button>
                );
              })}
              {quickFilterChips.authors.map((author) => {
                const isActive = searchQuery.toLowerCase().includes(author.toLowerCase());
                return (
                  <button
                    key={`author-${author}`}
                    onClick={() => {
                      if (isActive) {
                        setSearchQuery('');
                      } else {
                        setSearchQuery(author);
                      }
                    }}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] transition ${
                      isActive
                        ? 'bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 font-semibold shadow-2xs'
                        : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 border border-zinc-200/80 dark:border-zinc-700'
                    }`}
                  >
                    <span>{author}</span>
                  </button>
                );
              })}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[11px] text-zinc-400 hover:text-[#990000] underline ml-1 cursor-pointer"
                >
                  重置筛选
                </button>
              )}
            </div>
          )}

          {/* Controls: Tabs & Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-300">
              <button
                onClick={() => setFilterTab('all')}
                className={`px-2.5 py-1 rounded-md transition ${
                  filterTab === 'all'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs font-bold'
                    : 'hover:text-zinc-900'
                }`}
              >
                全部 ({bookshelf.length})
              </button>
              <button
                onClick={() => setFilterTab('reading')}
                className={`px-2.5 py-1 rounded-md transition ${
                  filterTab === 'reading'
                    ? 'bg-white dark:bg-zinc-700 text-[#990000] dark:text-white shadow-xs font-bold'
                    : 'hover:text-zinc-900'
                }`}
              >
                当前阅读
              </button>
              <button
                onClick={() => setFilterTab('completed')}
                className={`px-2.5 py-1 rounded-md transition ${
                  filterTab === 'completed'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs font-bold'
                    : 'hover:text-zinc-900'
                }`}
              >
                已完成
              </button>
              <button
                onClick={() => setFilterTab('in_progress')}
                className={`px-2.5 py-1 rounded-md transition ${
                  filterTab === 'in_progress'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs font-bold'
                    : 'hover:text-zinc-900'
                }`}
              >
                翻译中
              </button>
            </div>

            {/* Quick Actions (Backup, Restore, Save, Import) */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={onSaveCurrentStory}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#990000]/30 bg-[#990000]/5 hover:bg-[#990000]/10 text-[#990000] text-xs font-semibold shadow-xs transition"
                title="将当前工作台正在阅读的故事更新或存入书架"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>更新当前作品</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onImportNewStory();
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#990000] hover:bg-[#800000] text-white text-xs font-semibold shadow-xs transition"
                title="导入新作品到书架"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>导入新作品</span>
              </button>

              <button
                onClick={handleExportBackup}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-medium shadow-xs transition"
                title="下载全部书架备份到本地磁盘 (JSON)"
              >
                <FolderDown className="h-3.5 w-3.5 text-zinc-500" />
                <span>备份书架</span>
              </button>

              <label
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-medium shadow-xs transition cursor-pointer"
                title="从 JSON 备份文件恢复书架"
              >
                <FolderUp className="h-3.5 w-3.5 text-zinc-500" />
                <span>恢复备份</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          {/* Search Result Feedback Indicator */}
          {searchQuery && (
            <div className="flex items-center justify-between text-xs px-2 py-1 bg-amber-50/70 dark:bg-amber-950/20 rounded-md border border-amber-200/50 dark:border-amber-900/30 text-amber-900 dark:text-amber-200">
              <span className="flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5 text-amber-600" />
                <span>已找到 <strong>{filteredStories.length}</strong> 部包含关键字 “{searchQuery}” 的作品</span>
              </span>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-amber-800 dark:text-amber-300 hover:underline font-semibold"
              >
                清除搜索
              </button>
            </div>
          )}
        </div>

        {/* Stories Grid / Cards Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
          {filteredStories.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-[#990000] mb-3">
                {searchQuery ? <Search className="h-8 w-8" /> : <BookOpen className="h-8 w-8" />}
              </div>
              <h3 className="text-sm sm:text-base font-bold text-zinc-800 dark:text-zinc-200">
                {searchQuery ? `未找到与 “${searchQuery}” 匹配的作品` : '没有找到匹配的书架作品'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? '您可以尝试精简关键词（支持搜索作品标题、作者姓名或原作/同人分类），或者重置搜索条件。'
                  : '您可以通过「导入新作品」添加 HTML、PDF 或文本文件，也可以载入王尔德或欧·亨利的公版经典名篇。'}
              </p>
              <div className="mt-4 flex justify-center gap-2">
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 rounded-xl bg-[#990000] text-white text-xs font-bold hover:bg-[#800000] shadow-sm transition"
                  >
                    清空搜索条件
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onClose();
                      onImportNewStory();
                    }}
                    className="px-4 py-2 rounded-xl bg-[#990000] text-white text-xs font-bold hover:bg-[#800000] shadow-sm transition"
                  >
                    去导入新故事
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredStories.map((story) => {
                const isCurrent = story.id === currentStoryId;
                const percent =
                  story.totalBlocks > 0
                    ? Math.round((story.translatedBlocks / story.totalBlocks) * 100)
                    : 0;
                const isCompleted = percent >= 100;
                const bookmarkCount = story.bookmarks?.length || 0;
                const stats = calculateStoryStats(
                  story.blocks,
                  story.estimatedWords || story.ao3Meta?.stats?.words
                );

                return (
                  <div
                    key={story.id}
                    className={`group relative rounded-xl border p-4 transition-all duration-200 flex flex-col justify-between ${
                      isCurrent
                        ? 'border-[#990000] bg-white dark:bg-zinc-800 shadow-md ring-2 ring-[#990000]/15'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-800/70 hover:border-amber-300 dark:hover:border-zinc-700 hover:shadow-sm'
                    }`}
                  >
                    {/* Card Top: Badges & Title */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isCurrent ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-[#990000] text-white shadow-2xs animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-white" />
                              当前阅读中
                            </span>
                          ) : isCompleted ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="h-3 w-3" />
                              已译完
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              <Clock className="h-3 w-3" />
                              进行中
                            </span>
                          )}

                          {/* Reading time badge */}
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50/90 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800"
                            title={`按正常阅读速度估算：${stats.formattedLabel}`}
                          >
                            <Clock className="h-2.5 w-2.5 text-amber-600" />
                            <span>{stats.formattedLabel}</span>
                          </span>

                          {story.fileType && (
                            <span className="uppercase text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400">
                              {story.fileType}
                            </span>
                          )}

                          {bookmarkCount > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              <BookmarkIcon className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                              {bookmarkCount} 个书签
                            </span>
                          )}
                        </div>


                        {/* Delete confirmation or trigger */}
                        {deletingId === story.id ? (
                          <div className="flex items-center gap-1 animate-in fade-in">
                            <span className="text-[10px] text-red-600 font-bold">确定删除?</span>
                            <button
                              onClick={() => {
                                onDeleteStory(story.id);
                                setDeletingId(null);
                              }}
                              className="px-2 py-0.5 text-[10px] rounded-md bg-red-600 text-white font-bold hover:bg-red-700"
                            >
                              是
                            </button>
                            <button
                              onClick={() => setDeletingId(null)}
                              className="px-1.5 py-0.5 text-[10px] rounded-md bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
                            >
                              否
                            </button>
                          </div>
                        ) : (
                          bookshelf.length > 1 && (
                            <button
                              onClick={() => setDeletingId(story.id)}
                              className="opacity-40 group-hover:opacity-100 p-1 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                              title="从本地书架移除"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )
                        )}
                      </div>

                      {/* Title & Author */}
                      <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-[#990000] transition">
                        {story.title}
                      </h4>

                      {story.author && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                          作者：{story.author}
                        </p>
                      )}

                      {/* Fandom tags if present */}
                      {story.fandoms && story.fandoms.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {story.fandoms.slice(0, 2).map((fandom, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 max-w-[150px] truncate"
                            >
                              {fandom}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Card Bottom: Progress & Action */}
                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center justify-between text-xs mb-1.5 flex-wrap gap-1">
                        <span className="text-zinc-600 dark:text-zinc-300 font-medium text-[11px] flex items-center gap-1">
                          <Clock className="h-3 w-3 text-amber-600 shrink-0" />
                          <span>约 {stats.wordCount.toLocaleString()} 词</span>
                          <span className="text-zinc-300 dark:text-zinc-600">·</span>
                          <span className="text-[#990000] dark:text-amber-400 font-bold">{stats.formattedLabel}</span>
                        </span>
                        <span className="text-zinc-400 text-[10px] font-mono">
                          {new Date(story.updatedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1">
                        <span>翻译进度: {story.translatedBlocks}/{story.totalBlocks} 段</span>
                        <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">{percent}%</span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-zinc-100 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden mb-3">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            isCompleted
                              ? 'bg-emerald-500'
                              : 'bg-gradient-to-r from-[#990000] to-amber-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>


                      {/* Read button */}
                      <button
                        onClick={() => {
                          onSelectStory(story.id);
                          onClose();
                        }}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          isCurrent
                            ? 'bg-[#990000] text-white hover:bg-[#800000] shadow-xs'
                            : 'bg-zinc-100 dark:bg-zinc-700 hover:bg-[#990000] hover:text-white text-zinc-800 dark:text-zinc-200'
                        }`}
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>{isCurrent ? '继续当前阅读' : '载入阅读并切换'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Footer with Reminder */}
        <div className="px-4 sm:px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5 text-center sm:text-left">
            <HardDrive className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            <span>
              已为您在本地保存 <strong>{bookshelf.length}</strong> 部作品。网站无后台服务器，请记得常做备份。
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-semibold transition"
          >
            返回阅读
          </button>
        </div>
      </div>
    </div>
  );
};
