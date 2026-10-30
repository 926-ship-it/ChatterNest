import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
} from 'docx';
import { DocumentBlock, DocumentMeta, TypographyConfig } from '../types/document';

/**
 * Downloads a Blob as a file in the browser
 */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports bilingual document to Microsoft Word (.docx)
 * Supports 'table' (bilingual side-by-side 2 columns) and 'interlinear' (stacked paragraphs)
 */
export async function exportToWord(
  blocks: DocumentBlock[],
  meta: DocumentMeta,
  format: 'table' | 'interlinear' = 'table',
  _typography?: TypographyConfig
): Promise<void> {
  const titleText = meta.title || '双语对照翻译文档';
  const children: any[] = [];

  // Document Title Header
  children.push(
    new Paragraph({
      text: titleText,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200, before: 100 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `作者: ${meta.ao3Meta?.author || '未知'}  |  源语言: ${meta.sourceLang || '英文'}  |  译文: ${meta.targetLang || '中文'}  |  导出时间: ${new Date().toLocaleDateString('zh-CN')}`,
          color: '666666',
          size: 20, // 10pt
        }),
      ],
    })
  );

  // If story metadata exists, add an elegant Story Info Box
  if (meta.ao3Meta) {
    const ao3 = meta.ao3Meta;
    const tagLines: string[] = [];
    if (ao3.fandoms?.length) tagLines.push(`【作品分类】: ${ao3.fandoms.join(' / ')}`);
    if (ao3.rating) tagLines.push(`【作品分级】: ${ao3.rating}`);
    if (ao3.relationships?.length) tagLines.push(`【人物关系】: ${ao3.relationships.join(', ')}`);
    if (ao3.additionalTags?.length) tagLines.push(`【主题标签】: ${ao3.additionalTags.join(' / ')}`);

    children.push(
      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: tagLines.map(
          (line) =>
            new TextRun({
              text: line + '\n',
              size: 20,
              color: '883333',
            })
        ),
      })
    );

    if (ao3.summary) {
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 300 },
          children: [
            new TextRun({
              text: `故事简介 (Summary): ${ao3.summary}`,
              italics: true,
              size: 20,
              color: '555555',
            }),
          ],
        })
      );
    }
  }

  if (format === 'table') {
    // 2-Column Bilingual Table Layout
    const tableRows: TableRow[] = [];

    // Header row
    tableRows.push(
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            shading: { fill: 'F3F4F6' },
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: `原文 (${meta.sourceLang || 'Source'})`,
                    bold: true,
                    size: 22,
                    color: '374151',
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            shading: { fill: 'EEF2FF' },
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: `中文译文 (${meta.targetLang || 'Target'})`,
                    bold: true,
                    size: 22,
                    color: '1E40AF',
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );

    // Data rows for each block
    for (const b of blocks) {
      const isHeading = b.type.startsWith('h');
      const isQuote = b.type === 'blockquote';

      tableRows.push(
        new TableRow({
          cantSplit: true,
          children: [
            // Left Cell (Source)
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: {
                bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
                top: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
              },
              children: [
                new Paragraph({
                  spacing: { before: 80, after: 80 },
                  children: [
                    new TextRun({
                      text: (b.type === 'li' ? '• ' : '') + b.sourceText,
                      bold: isHeading,
                      italics: isQuote,
                      color: isHeading ? '111827' : '4B5563',
                      size: isHeading ? 24 : 21,
                    }),
                  ],
                }),
              ],
            }),
            // Right Cell (Target / Polish)
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: {
                bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
                top: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
              children: [
                new Paragraph({
                  spacing: { before: 80, after: 80 },
                  children: [
                    new TextRun({
                      text: (b.type === 'li' ? '• ' : '') + (b.targetText || '（尚未翻译）'),
                      bold: isHeading,
                      italics: isQuote,
                      color: isHeading ? '0F172A' : '1E293B',
                      size: isHeading ? 24 : 22,
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
      );
    }

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: tableRows,
      })
    );
  } else {
    // Interlinear / Stacked Paragraphs
    for (const b of blocks) {
      const isHeading = b.type.startsWith('h');
      
      // Source paragraph (muted)
      children.push(
        new Paragraph({
          spacing: { before: 120, after: 40 },
          children: [
            new TextRun({
              text: (b.type === 'li' ? '• ' : '') + b.sourceText,
              color: '6B7280',
              size: isHeading ? 22 : 20,
              italics: true,
            }),
          ],
        })
      );

      // Target paragraph (prominent)
      children.push(
        new Paragraph({
          spacing: { before: 0, after: 160 },
          children: [
            new TextRun({
              text: (b.type === 'li' ? '• ' : '') + (b.targetText || '（尚未翻译）'),
              bold: isHeading,
              color: '111827',
              size: isHeading ? 26 : 22,
            }),
          ],
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanName = (meta.title || 'bilingual-document').replace(/[\\/:*?"<>|]/g, '_');
  downloadBlob(blob, `${cleanName}_双语对照.docx`);
}

/**
 * Exports document to standalone bilingual HTML
 */
export function exportToHTML(
  blocks: DocumentBlock[],
  meta: DocumentMeta,
  themeClass = 'bg-[#FAF7F0] text-[#2C2825]'
): void {
  const htmlRows = blocks
    .map((b) => {
      const tag = b.type === 'h1' ? 'h2' : b.type === 'h2' ? 'h3' : b.type === 'h3' ? 'h4' : 'div';
      return `
      <div style="display:flex; gap:24px; padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.08); page-break-inside: avoid;">
        <${tag} style="flex:1; margin:0; color:#666; font-size:0.95em; line-height:1.6;">${escapeHtml(b.sourceText)}</${tag}>
        <${tag} style="flex:1; margin:0; color:#111; font-weight:500; font-size:1em; line-height:1.6;">${escapeHtml(b.targetText || '')}</${tag}>
      </div>
      `;
    })
    .join('\n');

  const fullHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(meta.title)} - 双语对照文档</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Songti SC", serif; max-width: 960px; margin: 40px auto; padding: 0 20px; }
    h1 { text-align: center; margin-bottom: 8px; }
    .meta { text-align: center; color: #777; margin-bottom: 32px; font-size: 14px; }
  </style>
</head>
<body class="${themeClass}">
  <h1>${escapeHtml(meta.title)}</h1>
  <div class="meta">源语言: ${escapeHtml(meta.sourceLang)} | 译文: ${escapeHtml(meta.targetLang)} | 导出自 LinguaLoom</div>
  <div class="content">
    ${htmlRows}
  </div>
</body>
</html>`;

  const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
  const cleanName = (meta.title || 'bilingual-document').replace(/[\\/:*?"<>|]/g, '_');
  downloadBlob(blob, `${cleanName}_双语对照.html`);
}

/**
 * Triggers high-fidelity browser PDF print dialog
 */
export function triggerPrintPDF(): void {
  window.print();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
