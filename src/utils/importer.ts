import { DocumentBlock, BlockType, DocumentMeta, Ao3WorkMeta } from '../types/document';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';

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

/**
 * Smart Parser for TXT / Markdown Story Files
 * Extracts metadata header (Title, Author, Fandom, Summary) and detects chapters/scenes
 */
export function parseTxtStoryFile(rawText: string, defaultTitle: string = 'Untitled Story'): {
  blocks: DocumentBlock[];
  meta: Partial<DocumentMeta>;
} {
  const lines = rawText.split(/\r?\n/);
  const ao3Meta: Ao3WorkMeta = {};
  let detectedTitle = '';
  let lineIdx = 0;
  const maxHeaderLines = Math.min(30, lines.length);

  // Scan top header lines for metadata
  while (lineIdx < maxHeaderLines) {
    const line = lines[lineIdx].trim();
    if (!line) {
      lineIdx++;
      continue;
    }

    const titleMatch = line.match(/^(?:Title|书名|标题)\s*[:：]\s*(.+)$/i);
    const authorMatch = line.match(/^(?:Author|By|作者)\s*[:：]\s*(.+)$/i);
    const fandomMatch = line.match(/^(?:Fandom|Fandoms|原作|同人分类)\s*[:：]\s*(.+)$/i);
    const summaryMatch = line.match(/^(?:Summary|简介|概述)\s*[:：]\s*(.+)$/i);
    const ratingMatch = line.match(/^(?:Rating|分级)\s*[:：]\s*(.+)$/i);
    const warningMatch = line.match(/^(?:Warning|Warnings|警告)\s*[:：]\s*(.+)$/i);
    const categoryMatch = line.match(/^(?:Category|Categories|分类|配对取向)\s*[:：]\s*(.+)$/i);
    const relMatch = line.match(/^(?:Relationship|Relationships|CP|配对)\s*[:：]\s*(.+)$/i);
    const charMatch = line.match(/^(?:Characters|角色|出场人物)\s*[:：]\s*(.+)$/i);

    if (titleMatch) {
      detectedTitle = titleMatch[1].trim();
      lineIdx++;
    } else if (authorMatch) {
      ao3Meta.author = authorMatch[1].trim();
      lineIdx++;
    } else if (fandomMatch) {
      ao3Meta.fandoms = fandomMatch[1].split(/[,，/、]/).map((s) => s.trim()).filter(Boolean);
      lineIdx++;
    } else if (summaryMatch) {
      ao3Meta.summary = summaryMatch[1].trim();
      lineIdx++;
    } else if (ratingMatch) {
      ao3Meta.rating = ratingMatch[1].trim();
      lineIdx++;
    } else if (warningMatch) {
      ao3Meta.warnings = warningMatch[1].split(/[,，/、]/).map((s) => s.trim()).filter(Boolean);
      lineIdx++;
    } else if (categoryMatch) {
      ao3Meta.categories = categoryMatch[1].split(/[,，/、]/).map((s) => s.trim()).filter(Boolean);
      lineIdx++;
    } else if (relMatch) {
      ao3Meta.relationships = relMatch[1].split(/[,，/、]/).map((s) => s.trim()).filter(Boolean);
      lineIdx++;
    } else if (charMatch) {
      ao3Meta.characters = charMatch[1].split(/[,，/、]/).map((s) => s.trim()).filter(Boolean);
      lineIdx++;
    } else if (/^[-=_*#]{3,}$/.test(line)) {
      // Header boundary line
      lineIdx++;
      break;
    } else if (lineIdx === 0 && !detectedTitle && lines[1]?.trim() === '' && line.length < 80) {
      // First standalone line as title
      detectedTitle = line;
      lineIdx++;
    } else {
      break;
    }
  }

  // Parse remaining body text into structured blocks
  const bodyText = lines.slice(lineIdx).join('\n');
  const rawParagraphs = bodyText.split(/\r?\n\s*\r?\n/);
  const blocks: DocumentBlock[] = [];
  let blockIndex = 0;

  for (const para of rawParagraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    // Detect chapter titles and major section dividers
    const isChapter =
      /^(?:Chapter\s+\d+|Chapter\s+[A-Za-z]+|CHAPTER\s+\d+|第[0-9零一二三四五六七八九十百千]+[章节卷回]|Prologue|Epilogue|Act\s+[IVXLCDM]+|Scene\s+\d+|Part\s+\d+|前言|尾声|终章)/i.test(
        trimmed
      ) && trimmed.length < 90;

    let type: BlockType = 'p';
    let cleanText = trimmed;

    if (isChapter) {
      type = 'h2';
    } else if (trimmed.startsWith('# ')) {
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
    } else {
      // For standard paragraphs, normalize soft wrap newlines into single spaces for English novels
      cleanText = cleanText.replace(/\r?\n/g, ' ');
    }

    blocks.push({
      id: `txt-block-${Date.now()}-${blockIndex++}`,
      type,
      sourceText: cleanText,
      targetText: '',
    });
  }

  return {
    blocks: blocks.length > 0 ? blocks : parsePlainTextToBlocks(rawText),
    meta: {
      title: detectedTitle || defaultTitle,
      fileType: 'txt',
      ao3Meta: Object.keys(ao3Meta).length > 0 ? ao3Meta : undefined,
    },
  };
}

/**
 * Dedicated Parser for EPUB e-books (.epub)
 * Reads standard ZIP container, parses OPF metadata, resolves manifest/spine, and extracts chapters
 */
export async function parseEPUBToBlocks(file: File): Promise<{
  blocks: DocumentBlock[];
  meta: Partial<DocumentMeta>;
}> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(file);

  let title = file.name.replace(/\.[^/.]+$/, '');
  let author = '';
  let summary = '';
  const fandoms: string[] = [];

  // 1. Locate container.xml to find .opf package file
  const containerXmlFile = loadedZip.file('META-INF/container.xml');
  let opfPath = '';

  if (containerXmlFile) {
    try {
      const containerText = await containerXmlFile.async('text');
      const parser = new DOMParser();
      const containerDoc = parser.parseFromString(containerText, 'application/xml');
      const rootfile = containerDoc.querySelector('rootfile');
      if (rootfile) {
        opfPath = rootfile.getAttribute('full-path') || '';
      }
    } catch (e) {
      console.warn('Could not parse container.xml:', e);
    }
  }

  // Fallback: search for any .opf file inside the zip
  if (!opfPath) {
    const opfFiles = loadedZip.file(/\.opf$/i);
    if (opfFiles.length > 0) {
      opfPath = opfFiles[0].name;
    }
  }

  const spineHtmlFiles: string[] = [];
  const opfDir = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : '';

  // 2. Parse OPF file (metadata, manifest, spine)
  if (opfPath) {
    const opfFile = loadedZip.file(opfPath);
    if (opfFile) {
      try {
        const opfText = await opfFile.async('text');
        const parser = new DOMParser();
        const opfDoc = parser.parseFromString(opfText, 'application/xml');

        // Extract Title
        const titleEl = opfDoc.querySelector('title, dc\\:title');
        if (titleEl?.textContent?.trim()) {
          title = titleEl.textContent.trim();
        }

        // Extract Author
        const authorEl = opfDoc.querySelector('creator, dc\\:creator');
        if (authorEl?.textContent?.trim()) {
          author = authorEl.textContent.trim();
        }

        // Extract Summary/Description
        const descEl = opfDoc.querySelector('description, dc\\:description');
        if (descEl?.textContent?.trim()) {
          summary = descEl.textContent.trim();
        }

        // Extract Subjects/Fandoms
        const subjectEls = opfDoc.querySelectorAll('subject, dc\\:subject');
        subjectEls.forEach((el) => {
          if (el.textContent?.trim()) fandoms.push(el.textContent.trim());
        });

        // Map manifest items (id -> href)
        const manifestMap = new Map<string, string>();
        const itemEls = opfDoc.querySelectorAll('manifest item');
        itemEls.forEach((item) => {
          const id = item.getAttribute('id');
          const href = item.getAttribute('href');
          if (id && href) {
            // Remove anchor hashes and resolve relative to opf directory
            const cleanHref = href.split('#')[0];
            const fullPath = opfDir ? `${opfDir}${cleanHref}` : cleanHref;
            manifestMap.set(id, fullPath);
          }
        });

        // Read reading order from spine
        const itemrefEls = opfDoc.querySelectorAll('spine itemref');
        itemrefEls.forEach((itemref) => {
          const idref = itemref.getAttribute('idref');
          if (idref && manifestMap.has(idref)) {
            const resolvedPath = manifestMap.get(idref)!;
            if (!spineHtmlFiles.includes(resolvedPath)) {
              spineHtmlFiles.push(resolvedPath);
            }
          }
        });
      } catch (err) {
        console.warn('Error parsing OPF metadata:', err);
      }
    }
  }

  // Fallback: If spine could not be parsed, locate all HTML/XHTML files in ZIP
  if (spineHtmlFiles.length === 0) {
    const htmlFiles = loadedZip.file(/\.(xhtml|html|htm)$/i);
    // Sort logically so chapters appear in sequence
    htmlFiles.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );
    htmlFiles.forEach((f) => {
      // Exclude toc.ncx or cover if it's purely a placeholder
      if (!/toc\.|nav\./i.test(f.name)) {
        spineHtmlFiles.push(f.name);
      }
    });
    // If still empty, add whatever html was found
    if (spineHtmlFiles.length === 0) {
      htmlFiles.forEach((f) => spineHtmlFiles.push(f.name));
    }
  }

  // 3. Extract text blocks from all HTML/XHTML chapters
  const blocks: DocumentBlock[] = [];
  let blockIndex = 0;
  const domParser = new DOMParser();

  for (const filePath of spineHtmlFiles) {
    const fileInZip = loadedZip.file(filePath);
    if (!fileInZip) continue;

    try {
      const htmlText = await fileInZip.async('text');
      const doc = domParser.parseFromString(htmlText, 'text/html');

      // Strip style/script tags
      doc.querySelectorAll('script, style, link, meta').forEach((el) => el.remove());

      // Query standard content elements
      const elements = doc.body.querySelectorAll('h1, h2, h3, h4, h5, h6, p, blockquote, li');

      if (elements.length > 0) {
        elements.forEach((el) => {
          const text = el.textContent?.trim().replace(/\s+/g, ' ') || '';
          if (!text) return;

          let type: BlockType = 'p';
          const tag = el.tagName.toLowerCase();
          if (tag === 'h1') type = 'h1';
          else if (tag === 'h2') type = 'h2';
          else if (tag === 'h3' || tag === 'h4' || tag === 'h5' || tag === 'h6') type = 'h3';
          else if (tag === 'blockquote') type = 'blockquote';
          else if (tag === 'li') type = 'li';

          blocks.push({
            id: `epub-block-${Date.now()}-${blockIndex++}`,
            type,
            sourceText: text,
            targetText: '',
          });
        });
      } else {
        // Fallback: extract paragraphs from raw body text
        const bodyText = doc.body.textContent || '';
        const rawBlocks = parsePlainTextToBlocks(bodyText);
        blocks.push(...rawBlocks);
      }
    } catch (err) {
      console.warn(`Error parsing chapter ${filePath}:`, err);
    }
  }

  return {
    blocks: blocks.length > 0 ? blocks : parsePlainTextToBlocks(`[EPUB 电子书: ${title}]`),
    meta: {
      title,
      fileType: 'epub',
      ao3Meta: {
        author: author || undefined,
        summary: summary || undefined,
        fandoms: fandoms.length > 0 ? fandoms : undefined,
      },
    },
  };
}
