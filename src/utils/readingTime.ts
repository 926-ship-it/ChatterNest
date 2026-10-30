import { DocumentBlock } from '../types/document';

/**
 * Counts English words and Chinese characters in a given string.
 */
export function countWordsInText(text: string): number {
  if (!text || typeof text !== 'string') return 0;

  // Match English/alphanumeric words
  const enMatches = text.match(/[a-zA-Z0-9]+(?:'[a-zA-Z0-9]+)?/g);
  const enCount = enMatches ? enMatches.length : 0;

  // Match CJK Chinese characters
  const cjkMatches = text.match(/[\u4e00-\u9fa5]/g);
  const cjkCount = cjkMatches ? cjkMatches.length : 0;

  // If text is primarily Chinese, count characters; if primarily English, count words
  if (cjkCount > 0 && enCount === 0) {
    return cjkCount;
  }
  return enCount + cjkCount;
}

/**
 * Estimates reading time in minutes based on total words/characters.
 * Average reading speed: ~220 words per minute (English) or ~380 characters per minute (Chinese).
 */
export function estimateReadingMinutes(wordCount: number): number {
  if (!wordCount || wordCount <= 0) return 1;
  // A comfortable reading speed benchmark of 220 words/minute for narrative fiction
  const minutes = Math.round(wordCount / 220);
  return Math.max(1, minutes);
}

/**
 * Formats reading minutes into human-readable Chinese string.
 * Example: "15 分钟", "约 1 小时 20 分钟", "< 1 分钟"
 */
export function formatReadingTime(minutes: number): string {
  if (minutes < 1) return '< 1 分钟';
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    if (remainingMins === 0) {
      return `约 ${hours} 小时`;
    }
    return `约 ${hours} 小时 ${remainingMins} 分钟`;
  }
  return `${minutes} 分钟`;
}

/**
 * Calculate comprehensive reading statistics for a story.
 */
export function calculateStoryStats(
  blocks: DocumentBlock[],
  explicitWords?: string | number
): {
  wordCount: number;
  minutes: number;
  formattedTime: string;
  formattedLabel: string;
} {
  let wordCount = 0;

  if (typeof explicitWords === 'number' && explicitWords > 0) {
    wordCount = explicitWords;
  } else if (typeof explicitWords === 'string' && explicitWords.trim()) {
    const parsed = parseInt(explicitWords.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(parsed) && parsed > 0) {
      wordCount = parsed;
    }
  }

  // Fallback: Calculate from blocks sourceText
  if (wordCount === 0 && Array.isArray(blocks) && blocks.length > 0) {
    for (const b of blocks) {
      wordCount += countWordsInText(b.sourceText || b.targetText || '');
    }
  }

  if (wordCount === 0) {
    wordCount = 1500; // Reasonable fallback for sample articles
  }

  const minutes = estimateReadingMinutes(wordCount);
  const formattedTime = formatReadingTime(minutes);

  return {
    wordCount,
    minutes,
    formattedTime,
    formattedLabel: `预计阅读时间：${formattedTime}`,
  };
}
