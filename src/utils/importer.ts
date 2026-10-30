import { DocumentBlock, BlockType, DocumentMeta, Ao3WorkMeta } from '../types/document';
import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker for Vite environment
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
} catch (e) {
  console.warn('PDF worker configuration notice:', e);
}

/**
 * Helper to clean and normalize text
 */
const getCleanText = (el: Element | null): string => {
  return el?.textContent?.trim().replace(/\s+/g, ' ') || '';
};

/**
 * Dedicated Parser for AO3 (Archive of Our Own) HTML downloads & pages
 */
export function parseAO3Document(htmlContent: string): {
  blocks: DocumentBlock[];
  meta: Partial<DocumentMeta>;
} {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  // 1. Extract AO3 Metadata
  const ao3Meta: Ao3WorkMeta = {};

  // Title
  const titleEl = doc.querySelector('.title.heading, #workskin h2.title, h1');
  const title = getCleanText(titleEl) || 'Untitled Story';

  // Author
  const authorEl = doc.querySelector('.byline.heading, .byline a, a[rel="author"]');
  if (authorEl) {
    ao3Meta.author = getCleanText(authorEl);
  }

  // Fandoms
  const fandomEls = doc.querySelectorAll('dd.fandom.tags a, .fandoms a');
  if (fandomEls.length > 0) {
    ao3Meta.fandoms = Array.from(fandomEls).map((el) => getCleanText(el)).filter(Boolean);
  }

  // Rating
  const ratingEl = doc.querySelector('dd.rating.tags a, .rating a');
  if (ratingEl) {
    ao3Meta.rating = getCleanText(ratingEl);
  }

  // Archive Warnings
  const warningEls = doc.querySelectorAll('dd.warning.tags a, .warnings a');
  if (warningEls.length > 0) {
    ao3Meta.warnings = Array.from(warningEls).map((el) => getCleanText(el)).filter(Boolean);
  }

  // Categories (e.g. M/M, F/M)
  const categoryEls = doc.querySelectorAll('dd.category.tags a, .category a');
  if (categoryEls.length > 0) {
    ao3Meta.categories = Array.from(categoryEls).map((el) => getCleanText(el)).filter(Boolean);
  }

  // Relationships (CP pairings)
  const relEls = doc.querySelectorAll('dd.relationship.tags a, .relationships a');
  if (relEls.length > 0) {
    ao3Meta.relationships = Array.from(relEls).map((el) => getCleanText(el)).filter(Boolean);
  }

  // Characters
  const charEls = doc.querySelectorAll('dd.character.tags a, .characters a');
  if (charEls.length > 0) {
    ao3Meta.characters = Array.from(charEls).map((el) => getCleanText(el)).filter(Boolean);
  }

  // Additional / Freeform Tags
  const freeformEls = doc.querySelectorAll('dd.freeform.tags a, .freeform a');
  if (freeformEls.length > 0) {
    ao3Meta.additionalTags = Array.from(freeformEls).map((el) => getCleanText(el)).filter(Boolean);
  }

  // Summary
  const summaryEl = doc.querySelector('.summary.module .userstuff, .summary blockquote, .summary p');
  if (summaryEl) {
    ao3Meta.summary = getCleanText(summaryEl);
  }

  // Notes
  const notesEl = doc.querySelector('.notes.module .userstuff, .preface .notes p, .notes');
  if (notesEl) {
    ao3Meta.notes = getCleanText(notesEl);
  }

  // 2. Extract Story Text Content
  // In AO3 downloads, the work body is nested inside `.userstuff` or `#chapters`
  const storyRoot = doc.querySelector('#chapters, .userstuff, #workskin') || doc.body;

  // Find paragraphs, headings, blockquotes
  const elements = storyRoot.querySelectorAll(
    'h1, h2, h3, h4, p, blockquote, ul > li, ol > li'
  );

  const blocks: DocumentBlock[] = [];
  let blockIndex = 0;

  // Filter out preface metadata tags that might have matched as general elements
  elements.forEach((el) => {
    // Skip if element is inside preface, tags list, or header metadata
    if ((el.closest('.preface') || el.closest('.tags') || el.closest('dl')) && !el.closest('.userstuff')) {
      return;
    }

    const tagName = el.tagName.toLowerCase();
    const text = getCleanText(el);
    if (!text) return;

    let type: BlockType = 'p';
    if (tagName === 'h1') type = 'h1';
    else if (tagName === 'h2') type = 'h2';
    else if (tagName === 'h3') type = 'h3';
    else if (tagName === 'h4') type = 'h4';
    else if (tagName === 'blockquote') type = 'blockquote';
    else if (tagName === 'li') type = 'li';

    blocks.push({
      id: `ao3-block-${Date.now()}-${blockIndex++}`,
      type,
      sourceText: text,
      targetText: '',
    });
  });

  return {
    blocks: blocks.length > 0 ? blocks : parsePlainTextToBlocks(doc.body.innerText || ''),
    meta: {
      title,
      fileName: `${title.replace(/\s+/g, '_')}.html`,
      fileType: 'ao3',
      ao3Meta,
    },
  };
}

/**
 * Parses an HTML string into structured DocumentBlocks (supports AO3 and general HTML)
 */
export function parseHTMLToBlocks(htmlContent: string): DocumentBlock[] {
  const isAO3 =
    htmlContent.includes('workskin') ||
    htmlContent.includes('userstuff') ||
    htmlContent.includes('Archive of Our Own') ||
    htmlContent.includes('byline');

  if (isAO3) {
    const { blocks } = parseAO3Document(htmlContent);
    if (blocks.length > 0) return blocks;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const blocks: DocumentBlock[] = [];

  const elements = doc.body.querySelectorAll(
    'h1, h2, h3, h4, h5, h6, p, blockquote, ul > li, ol > li, pre, table'
  );

  if (elements.length === 0) {
    const bodyText = doc.body.innerText || doc.body.textContent || '';
    return parsePlainTextToBlocks(bodyText);
  }

  let blockIndex = 0;
  elements.forEach((el) => {
    const tagName = el.tagName.toLowerCase();
    const text = getCleanText(el);
    if (!text && tagName !== 'table') return;

    let type: BlockType = 'p';
    if (tagName === 'h1') type = 'h1';
    else if (tagName === 'h2') type = 'h2';
    else if (tagName === 'h3') type = 'h3';
    else if (tagName === 'h4' || tagName === 'h5' || tagName === 'h6') type = 'h4';
    else if (tagName === 'blockquote') type = 'blockquote';
    else if (tagName === 'li') type = 'li';
    else if (tagName === 'pre') type = 'code';
    else if (tagName === 'table') type = 'table';

    blocks.push({
      id: `block-${Date.now()}-${blockIndex++}`,
      type,
      sourceText: text,
      targetText: '',
    });
  });

  return blocks;
}

/**
 * Parses plain text / markdown into DocumentBlocks
 */
export function parsePlainTextToBlocks(rawText: string): DocumentBlock[] {
  const lines = rawText.split(/\r?\n\r?\n|\r?\n/);
  const blocks: DocumentBlock[] = [];
  let index = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let type: BlockType = 'p';
    let cleanText = trimmed;

    if (trimmed.startsWith('# ')) {
      type = 'h1';
      cleanText = trimmed.replace(/^#\s+/, '');
    } else if (trimmed.startsWith('## ')) {
      type = 'h2';
      cleanText = trimmed.replace(/^##\s+/, '');
    } else if (trimmed.startsWith('### ')) {
      type = 'h3';
      cleanText = trimmed.replace(/^###\s+/, '');
    } else if (trimmed.startsWith('> ')) {
      type = 'blockquote';
      cleanText = trimmed.replace(/^>\s+/, '');
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed)) {
      type = 'li';
      cleanText = trimmed.replace(/^([-*]|\d+\.)\s+/, '');
    }

    blocks.push({
      id: `block-${Date.now()}-${index++}`,
      type,
      sourceText: cleanText,
      targetText: '',
    });
  }

  return blocks;
}

/**
 * Extracts and structure-identifies text from a PDF file
 */
export async function parsePDFToBlocks(file: File): Promise<DocumentBlock[]> {
  const arrayBuffer = await file.arrayBuffer();

  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;
    const rawParagraphs: { text: string; fontSize: number }[] = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();

      let currentLine = '';
      let currentFontSize = 12;

      for (const item of textContent.items as any[]) {
        if ('str' in item) {
          const str = item.str;
          const fontSize = Math.round(item.transform?.[0] || item.height || 12);

          if (item.hasEOL) {
            currentLine += (currentLine ? ' ' : '') + str;
            if (currentLine.trim()) {
              rawParagraphs.push({ text: currentLine.trim(), fontSize: currentFontSize });
            }
            currentLine = '';
          } else {
            currentLine += (currentLine ? ' ' : '') + str;
            currentFontSize = fontSize;
          }
        }
      }

      if (currentLine.trim()) {
        rawParagraphs.push({ text: currentLine.trim(), fontSize: currentFontSize });
      }
    }

    const blocks: DocumentBlock[] = [];
    let blockIndex = 0;
    let accumulatedText = '';
    let accumulatedType: BlockType = 'p';

    const flushAccumulated = () => {
      if (accumulatedText.trim()) {
        blocks.push({
          id: `pdf-block-${Date.now()}-${blockIndex++}`,
          type: accumulatedType,
          sourceText: accumulatedText.trim(),
          targetText: '',
        });
        accumulatedText = '';
      }
    };

    for (const item of rawParagraphs) {
      let type: BlockType = 'p';
      if (item.fontSize >= 18) type = 'h1';
      else if (item.fontSize >= 15) type = 'h2';
      else if (item.fontSize >= 13) type = 'h3';
      else if (item.text.startsWith('•') || item.text.startsWith('-') || /^\d+\./.test(item.text)) {
        type = 'li';
      }

      if (type !== 'p') {
        flushAccumulated();
        blocks.push({
          id: `pdf-block-${Date.now()}-${blockIndex++}`,
          type,
          sourceText: item.text,
          targetText: '',
        });
      } else {
        if (
          accumulatedText &&
          !accumulatedText.endsWith('.') &&
          !accumulatedText.endsWith('!') &&
          !accumulatedText.endsWith('?')
        ) {
          accumulatedText += ' ' + item.text;
        } else {
          flushAccumulated();
          accumulatedText = item.text;
          accumulatedType = 'p';
        }
      }
    }
    flushAccumulated();

    if (blocks.length > 0) return blocks;
  } catch (err) {
    console.warn('PDF parsing issue:', err);
  }

  const text = await file.text().catch(() => '');
  return parsePlainTextToBlocks(text || `[Document: ${file.name}]`);
}
