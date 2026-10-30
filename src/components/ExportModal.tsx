import React, { useState } from 'react';
import {
  X,
  FileText,
  Printer,
  FileCode,
  Download,
  Check,
  Columns,
  AlignJustify,
  Copy,
  Sparkles,
} from 'lucide-react';
import { DocumentBlock, DocumentMeta, TypographyConfig } from '../types/document';
import { exportToWord, exportToHTML, triggerPrintPDF } from '../utils/exporter';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  blocks: DocumentBlock[];
  meta: DocumentMeta;
  typography: TypographyConfig;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  blocks,
  meta,
  typography,
}) => {
  const [wordLayout, setWordLayout] = useState<'table' | 'interlinear'>('table');
  const [isExportingWord, setIsExportingWord] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);

  if (!isOpen) return null;

  const translatedCount = blocks.filter((b) => b.targetText.trim()).length;

  const handleExportWord = async () => {
    setIsExportingWord(true);
    try {
      await exportToWord(blocks, meta, wordLayout, typography);
      onClose();
    } catch (err) {
      console.error('Word export error:', err);
      alert('导出 Word 文件时遇到问题，请重试');
    } finally {
      setIsExportingWord(false);
    }
  };

  const handleExportHTML = () => {
    exportToHTML(blocks, meta);
    onClose();
  };

  const handlePrintPDF = () => {
    onClose();
    setTimeout(() => {
      triggerPrintPDF();
    }, 200);
  };

  const handleCopyMarkdown = () => {
    const md = blocks
      .map((b) => {
        const prefix = b.type.startsWith('h') ? '### ' : '';
        return `${prefix}${b.sourceText}\n\n${prefix}${b.targetText || '（尚未翻译）'}\n\n---`;
      })
      .join('\n\n');

    navigator.clipboard.writeText(md);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
              <Download className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                导出双语对照文档
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                支持保留原始结构导出为规范 Word (.docx)、矢量 PDF 或离线 HTML
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status info */}
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{meta.title}</span>
              <div className="text-zinc-500 mt-0.5">
                包含 {blocks.length} 个结构段落（已译 {translatedCount} 段）
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              格式保持已对齐
            </span>
          </div>

          {/* 1. Word Export Section */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              1. 导出为 Microsoft Word (.docx)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setWordLayout('table')}
                className={`p-3 rounded-xl border-2 text-left transition flex flex-col justify-between ${
                  wordLayout === 'table'
                    ? 'border-amber-600 bg-amber-50/40 dark:bg-amber-950/20'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                    <Columns className="h-4 w-4 text-amber-600" />
                    <span>双语左右分栏表格</span>
                  </div>
                  {wordLayout === 'table' && <Check className="h-3.5 w-3.5 text-amber-600" />}
                </div>
                <p className="text-[11px] text-zinc-500">
                  行业标准：左列原文、右列译文，便于审阅校验
                </p>
              </button>

              <button
                onClick={() => setWordLayout('interlinear')}
                className={`p-3 rounded-xl border-2 text-left transition flex flex-col justify-between ${
                  wordLayout === 'interlinear'
                    ? 'border-amber-600 bg-amber-50/40 dark:bg-amber-950/20'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                    <AlignJustify className="h-4 w-4 text-amber-600" />
                    <span>逐段上下交替对照</span>
                  </div>
                  {wordLayout === 'interlinear' && <Check className="h-3.5 w-3.5 text-amber-600" />}
                </div>
                <p className="text-[11px] text-zinc-500">
                  逐段交替呈现，突出中文重点，适合沉浸通读
                </p>
              </button>
            </div>

            <button
              onClick={handleExportWord}
              disabled={isExportingWord}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold text-sm shadow-xs transition"
            >
              <FileText className="h-4 w-4" />
              <span>{isExportingWord ? '正在生成 Word 文档...' : '生成并下载 .docx 文件'}</span>
            </button>
          </div>

          {/* 2. PDF & Print Section */}
          <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              2. 导出为 PDF / 打印
            </label>
            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Printer className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                  <span>高保真打印 / 另存为 PDF</span>
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  自动启用 A4 排版与矢量字形，去除所有界面按钮，直接生成标准 PDF
                </div>
              </div>
              <button
                onClick={handlePrintPDF}
                className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-white transition shrink-0"
              >
                立即唤起打印
              </button>
            </div>
          </div>

          {/* 3. HTML & Markdown Section */}
          <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              3. 其它格式导出
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExportHTML}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 transition"
              >
                <FileCode className="h-4 w-4 text-indigo-500" />
                <span>导出独立 HTML 网页</span>
              </button>
              <button
                onClick={handleCopyMarkdown}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 transition"
              >
                {copiedMarkdown ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4 text-zinc-500" />
                )}
                <span>{copiedMarkdown ? '已复制 Markdown' : '复制双语 Markdown'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-3.5 bg-zinc-50 dark:bg-zinc-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
