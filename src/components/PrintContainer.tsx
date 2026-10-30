import React from 'react';
import { DocumentBlock, DocumentMeta, TypographyConfig } from '../types/document';

interface PrintContainerProps {
  blocks: DocumentBlock[];
  meta: DocumentMeta;
  typography: TypographyConfig;
}

export const PrintContainer: React.FC<PrintContainerProps> = ({
  blocks,
  meta,
  typography,
}) => {
  const fontClass =
    typography.fontFamily === 'serif'
      ? 'font-reading-serif'
      : typography.fontFamily === 'kaiti'
      ? 'font-reading-kaiti'
      : typography.fontFamily === 'mono'
      ? 'font-reading-mono'
      : 'font-reading-sans';

  return (
    <div className="hidden print-only print-container max-w-4xl mx-auto p-4 text-black bg-white">
      {/* Print Document Header */}
      <div className="text-center pb-6 mb-6 border-b border-gray-300">
        <h1 className="text-2xl font-bold mb-2 text-gray-900">{meta.title}</h1>
        <div className="text-xs text-gray-500 space-x-3">
          <span>源语言: {meta.sourceLang || '英文'}</span>
          <span>•</span>
          <span>目标语言: {meta.targetLang || '中文'}</span>
          <span>•</span>
          <span>导出时间: {new Date().toLocaleDateString('zh-CN')}</span>
        </div>
      </div>

      {/* Bilingual Print Rows */}
      <div className="space-y-4">
        {blocks.map((block, idx) => {
          const isH1 = block.type === 'h1';
          const isH2 = block.type === 'h2';
          const isH3 = block.type === 'h3';
          const isHeading = isH1 || isH2 || isH3;

          return (
            <div
              key={block.id || idx}
              className="print-bilingual-row flex gap-6 py-2 border-b border-gray-100"
            >
              {/* Left: Source */}
              <div
                className={`w-1/2 text-gray-600 ${fontClass} ${
                  isHeading ? 'font-bold text-gray-800' : 'text-xs'
                }`}
              >
                {block.type === 'li' ? '• ' : ''}
                {block.sourceText}
              </div>

              {/* Right: Target */}
              <div
                className={`w-1/2 text-gray-900 ${fontClass} ${
                  isHeading ? 'font-bold text-black' : 'text-sm font-medium'
                }`}
              >
                {block.type === 'li' ? '• ' : ''}
                {block.targetText || '（尚未翻译）'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Print Footer */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-center text-[10px] text-gray-400">
        由 ChatterFic 双语同人排版与AI润色平台生成
      </div>
    </div>
  );
};
