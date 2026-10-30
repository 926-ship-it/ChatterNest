import React, { useState } from 'react';
import {
  Heart,
  Users,
  Tag,
  BookOpen,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Share2,
} from 'lucide-react';
import { Ao3WorkMeta, ThemeConfig } from '../types/document';
import { calculateStoryStats } from '../utils/readingTime';

interface Ao3HeaderCardProps {
  meta: Ao3WorkMeta;
  title: string;
  theme: ThemeConfig;
  totalWordsEstimate?: number;
}

export const Ao3HeaderCard: React.FC<Ao3HeaderCardProps> = ({
  meta,
  title,
  theme,
  totalWordsEstimate = 0,
}) => {
  const [showFullSummary, setShowFullSummary] = useState(true);
  const [showNotes, setShowNotes] = useState(false);

  // Rating color map
  const getRatingBadge = (rating?: string) => {
    const r = rating?.toLowerCase() || '';
    if (r.includes('explicit')) {
      return { label: 'Explicit (E级)', bg: 'bg-red-600 text-white', border: 'border-red-700' };
    }
    if (r.includes('mature')) {
      return { label: 'Mature (M级)', bg: 'bg-amber-600 text-white', border: 'border-amber-700' };
    }
    if (r.includes('teen')) {
      return { label: 'Teen (T级)', bg: 'bg-yellow-500 text-zinc-900', border: 'border-yellow-600' };
    }
    return { label: 'General (G级)', bg: 'bg-emerald-600 text-white', border: 'border-emerald-700' };
  };

  const ratingBadge = getRatingBadge(meta.rating);

  // Calculate story word count and reading time estimate
  const effectiveWordCount = meta.stats?.words
    ? parseInt(meta.stats.words.replace(/[^0-9]/g, ''), 10) || totalWordsEstimate || 2000
    : totalWordsEstimate || 2000;
  const readingStats = calculateStoryStats([], effectiveWordCount);

  return (
    <div
      className={`no-print mb-6 rounded-2xl border ${theme.cardBg} ${theme.border} p-5 sm:p-6 shadow-sm transition-all relative overflow-hidden`}
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#990000] via-[#c23b3b] to-[#990000]" />

      {/* Header Title & Author */}
      <div className="space-y-1.5 pb-4 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-black tracking-wider px-2 py-0.5 rounded-sm bg-[#990000] text-white uppercase shadow-xs">
            作品导览
          </span>
          {meta.rating && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${ratingBadge.bg} shadow-xs`}
            >
              {ratingBadge.label}
            </span>
          )}
          {meta.categories && meta.categories.length > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              {meta.categories.join(' / ')}
            </span>
          )}

          {/* Reading Time Badge */}
          <span className="text-xs text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5 sm:ml-auto font-medium bg-zinc-100/90 dark:bg-zinc-800/90 px-2.5 py-1 rounded-full border border-zinc-200/60 dark:border-zinc-700/60 shadow-2xs">
            <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="text-zinc-500 dark:text-zinc-400">约 {effectiveWordCount.toLocaleString()} 词</span>
            <span className="text-zinc-300 dark:text-zinc-600">·</span>
            <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{readingStats.formattedLabel}</span>
          </span>
        </div>


        <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
          {title}
        </h1>

        {meta.author && (
          <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            原作者: <strong className="text-zinc-800 dark:text-zinc-200">{meta.author}</strong>
            {meta.series && <span className="ml-2 text-zinc-400">({meta.series})</span>}
          </div>
        )}
      </div>

      {/* Story Tags Matrix */}
      <div className="py-3.5 space-y-2.5 text-xs border-b border-black/5 dark:border-white/5">
        {/* Fandoms / Categories */}
        {meta.fandoms && meta.fandoms.length > 0 && (
          <div className="flex items-start gap-2">
            <span className="font-semibold text-zinc-500 shrink-0 w-16 sm:w-20 text-[11px]">
              作品分类:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {meta.fandoms.map((f, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md font-medium bg-amber-500/10 text-amber-800 dark:text-amber-300 text-[11px]"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Relationships */}
        {meta.relationships && meta.relationships.length > 0 && (
          <div className="flex items-start gap-2">
            <span className="font-semibold text-red-700 dark:text-red-400 shrink-0 w-16 sm:w-20 text-[11px] flex items-center gap-1">
              <Heart className="h-3 w-3 fill-current" /> 人物关系:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {meta.relationships.map((cp, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md font-bold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 text-[11px]"
                >
                  {cp}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Characters */}
        {meta.characters && meta.characters.length > 0 && (
          <div className="flex items-start gap-2">
            <span className="font-semibold text-zinc-500 shrink-0 w-16 sm:w-20 text-[11px]">
              主要角色:
            </span>
            <div className="flex flex-wrap gap-1.5 text-zinc-700 dark:text-zinc-300 text-[11px]">
              {meta.characters.join(', ')}
            </div>
          </div>
        )}

        {/* Additional Tags / Tropes */}
        {meta.additionalTags && meta.additionalTags.length > 0 && (
          <div className="flex items-start gap-2">
            <span className="font-semibold text-zinc-500 shrink-0 w-16 sm:w-20 text-[11px] flex items-center gap-1">
              <Tag className="h-3 w-3" /> 附加标签:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {meta.additionalTags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-full font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[11px] hover:bg-zinc-200 transition"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summary Section */}
      {meta.summary && (
        <div className="pt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
              <BookOpen className="h-3 w-3" /> 故事简介 (Summary):
            </span>
            <button
              onClick={() => setShowFullSummary(!showFullSummary)}
              className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 flex items-center gap-0.5"
            >
              {showFullSummary ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              <span>{showFullSummary ? '收起' : '展开'}</span>
            </button>
          </div>

          {showFullSummary && (
            <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed italic">
              {meta.summary}
            </div>
          )}
        </div>
      )}

      {/* Author Notes toggle */}
      {meta.notes && (
        <div className="pt-2">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="text-[11px] font-medium text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>作者前言与寄语 (Author's Notes)</span>
            {showNotes ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {showNotes && (
            <div className="mt-1.5 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {meta.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
