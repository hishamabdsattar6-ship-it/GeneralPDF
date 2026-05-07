import { PDFDocument } from 'pdf-lib';

self.onmessage = async (e: MessageEvent) => {
  const { action, payload, id } = e.data;
  
  try {
    let result;
    if (action === 'merge') {
      result = await handleMerge(payload.files);
    } else if (action === 'split') {
      result = await handleSplit(payload.file, payload.ranges); // Ranges could be [{start, end}]
    } else if (action === 'compress') {
      result = await handleCompress(payload.file); // pdf-lib basic compress isn't true compression, mostly re-serialization
    } else {
      throw new Error(`Unknown action: ${action}`);
    }

    self.postMessage({ id, status: 'success', result });
  } catch (error: any) {
    self.postMessage({ id, status: 'error', error: error.message || 'Unknown error' });
  }
};

async function handleMerge(filesData: ArrayBuffer[]): Promise<ArrayBuffer> {
  const mergedPdf = await PDFDocument.create();
  
  for (const fileData of filesData) {
    const pdf = await PDFDocument.load(fileData);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  
  const mergedBytes = await mergedPdf.save({ useObjectStreams: false }); // pdf-lib saving logic
  return mergedBytes.buffer;
}

// Very basic split logic. Extracts ranges and creates separate PDFs or one ZIP, let's just extract to one new PDF containing those pages for now.
async function handleSplit(fileData: ArrayBuffer, ranges: {start: number, end: number}[]): Promise<ArrayBuffer> {
  const srcPdf = await PDFDocument.load(fileData);
  const newPdf = await PDFDocument.create();
  
  const totalPages = srcPdf.getPageCount();
  const pagesToExtract: number[] = [];
  
  ranges.forEach(range => {
    if (range.start === undefined || range.end === undefined) return;
    const start = Math.max(0, range.start - 1);
    const end = Math.min(totalPages - 1, range.end - 1);
    for(let i = start; i <= end; i++) {
        pagesToExtract.push(i);
    }
  });

  if (pagesToExtract.length === 0) {
    throw new Error('No pages selected to extract.');
  }

  const copiedPages = await newPdf.copyPages(srcPdf, pagesToExtract);
  copiedPages.forEach(page => newPdf.addPage(page));

  const newBytes = await newPdf.save();
  return newBytes.buffer;
}

async function handleCompress(fileData: ArrayBuffer): Promise<ArrayBuffer> {
  // pdf-lib can't natively compress images heavily like ghostscript, but re-saving with useObjectStreams helps.
  const srcPdf = await PDFDocument.load(fileData);
  const newBytes = await srcPdf.save({ useObjectStreams: true });
  return newBytes.buffer;
}
