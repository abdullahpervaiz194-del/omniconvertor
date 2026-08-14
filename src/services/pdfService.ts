import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { Document, Paragraph, TextRun, HeadingLevel, Packer } from 'docx';
import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
} catch (e) {
  console.warn('PDF.js worker initialization:', e);
}

/**
 * 1. PDF to Word (.docx) conversion
 */
export async function convertPdfToDocx(
  pdfFile: File,
  onProgress?: (percent: number, message: string) => void
): Promise<Blob> {
  onProgress?.(10, 'Loading PDF document...');
  const arrayBuffer = await pdfFile.arrayBuffer();

  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  onProgress?.(25, `Analyzing ${numPages} PDF page${numPages > 1 ? 's' : ''}...`);

  const docxSectionsChildren: any[] = [];

  // Add document header
  docxSectionsChildren.push(
    new Paragraph({
      text: pdfFile.name.replace(/\.[^/.]+$/, ''),
      heading: HeadingLevel.TITLE,
      spacing: { after: 300 }
    })
  );

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const percent = Math.round(25 + (pageNum / numPages) * 50);
    onProgress?.(percent, `Extracting text and structure from page ${pageNum} of ${numPages}...`);

    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    // Sort text items by Y (descending) and then X (ascending)
    const items = textContent.items as Array<{ str: string; transform: number[]; hasEOL?: boolean }>;

    if (items.length === 0) {
      docxSectionsChildren.push(
        new Paragraph({
          children: [new TextRun({ text: `[Page ${pageNum} - Image / Non-text content]`, italics: true, color: '888888' })],
          spacing: { after: 200 }
        })
      );
    } else {
      // Group text into lines/paragraphs based on Y coordinate
      let currentLine: string[] = [];
      let lastY: number | null = null;

      for (const item of items) {
        const itemY = item.transform[5];
        if (lastY !== null && Math.abs(itemY - lastY) > 6) {
          // New line / paragraph
          if (currentLine.length > 0) {
            const lineText = currentLine.join(' ').trim();
            if (lineText) {
              // Check if likely a heading (short text, uppercase or strong)
              const isHeading = lineText.length < 50 && (lineText === lineText.toUpperCase() || lineText.endsWith(':'));
              docxSectionsChildren.push(
                new Paragraph({
                  children: [new TextRun({ text: lineText, bold: isHeading })],
                  heading: isHeading ? HeadingLevel.HEADING_2 : undefined,
                  spacing: { after: isHeading ? 180 : 120 }
                })
              );
            }
            currentLine = [];
          }
        }
        currentLine.push(item.str);
        lastY = itemY;
      }

      if (currentLine.length > 0) {
        const lineText = currentLine.join(' ').trim();
        if (lineText) {
          docxSectionsChildren.push(
            new Paragraph({
              children: [new TextRun({ text: lineText })],
              spacing: { after: 120 }
            })
          );
        }
      }
    }

    if (pageNum < numPages) {
      // Page break between pages
      docxSectionsChildren.push(
        new Paragraph({
          children: [new TextRun({ text: '', break: 1 })],
          pageBreakBefore: true
        })
      );
    }
  }

  onProgress?.(85, 'Building Word (.docx) document structure...');

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docxSectionsChildren
      }
    ]
  });

  onProgress?.(95, 'Compiling DOCX binary package...');
  const docxBlob = await Packer.toBlob(doc);
  onProgress?.(100, 'Word document ready!');
  return docxBlob;
}

/**
 * 2. Word (.docx) to PDF conversion
 */
export async function convertDocxToPdf(
  docxFile: File,
  onProgress?: (percent: number, message: string) => void
): Promise<Blob> {
  onProgress?.(15, 'Parsing Word document structure...');
  const arrayBuffer = await docxFile.arrayBuffer();

  const mammothResult = await mammoth.convertToHtml({ arrayBuffer });
  const htmlContent = mammothResult.value;

  onProgress?.(45, 'Formatting PDF typography and layout...');

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 40;
  const maxWidth = pageWidth - margin * 2;

  // Render HTML structure onto PDF
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;

  let cursorY = margin + 20;

  // Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(20, 20, 20);
  pdf.text(docxFile.name.replace(/\.[^/.]+$/, ''), margin, cursorY);
  cursorY += 25;

  pdf.setDrawColor(220, 220, 220);
  pdf.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 20;

  const childNodes = Array.from(tempDiv.children);

  for (let i = 0; i < childNodes.length; i++) {
    const node = childNodes[i];
    const text = node.textContent?.trim() || '';
    if (!text) continue;

    const tagName = node.tagName.toLowerCase();

    if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3') {
      if (cursorY > pageHeight - margin - 50) {
        pdf.addPage();
        cursorY = margin + 20;
      }
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(tagName === 'h1' ? 16 : tagName === 'h2' ? 14 : 12);
      pdf.setTextColor(30, 41, 59);
      cursorY += 10;
      pdf.text(text, margin, cursorY);
      cursorY += tagName === 'h1' ? 18 : 14;
    } else if (tagName === 'table') {
      const rows: string[][] = [];
      const trElements = Array.from(node.querySelectorAll('tr'));
      trElements.forEach(tr => {
        const cells = Array.from(tr.querySelectorAll('td, th')).map(c => c.textContent?.trim() || '');
        if (cells.length > 0) rows.push(cells);
      });

      if (rows.length > 0) {
        autoTable(pdf, {
          startY: cursorY,
          head: rows.length > 1 ? [rows[0]] : undefined,
          body: rows.length > 1 ? rows.slice(1) : rows,
          margin: { left: margin, right: margin },
          theme: 'striped',
          styles: { fontSize: 9, cellPadding: 4 },
          headStyles: { fillColor: [41, 128, 185] }
        });
        cursorY = (pdf as any).lastAutoTable.finalY + 15;
      }
    } else {
      // Paragraph or list item
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(51, 51, 51);

      const isBullet = tagName === 'li';
      const displayText = isBullet ? `•  ${text}` : text;
      const lines = pdf.splitTextToSize(displayText, maxWidth);

      for (const line of lines) {
        if (cursorY > pageHeight - margin - 20) {
          pdf.addPage();
          cursorY = margin + 20;
        }
        pdf.text(line, margin, cursorY);
        cursorY += 14;
      }
      cursorY += 6;
    }

    const percent = Math.round(45 + (i / childNodes.length) * 45);
    onProgress?.(percent, `Rendering document section ${i + 1} of ${childNodes.length}...`);
  }

  onProgress?.(95, 'Finalizing PDF document...');
  const pdfBlob = pdf.output('blob');
  onProgress?.(100, 'PDF generation complete!');
  return pdfBlob;
}

/**
 * 3. Excel (.xlsx) to PDF conversion
 */
export async function convertExcelToPdf(
  excelFile: File,
  options: { orientation: 'portrait' | 'landscape'; selectedSheet?: string; allSheets?: boolean },
  onProgress?: (percent: number, message: string) => void
): Promise<Blob> {
  onProgress?.(15, 'Reading workbook and sheets...');
  const arrayBuffer = await excelFile.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  const sheetNames = workbook.SheetNames;
  if (sheetNames.length === 0) {
    throw new Error('No sheets found in Excel file.');
  }

  const sheetsToProcess = options.allSheets
    ? sheetNames
    : [options.selectedSheet || sheetNames[0]];

  onProgress?.(35, `Formatting ${sheetsToProcess.length} sheet${sheetsToProcess.length > 1 ? 's' : ''} for PDF...`);

  const pdf = new jsPDF({
    orientation: options.orientation,
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  let firstSheet = true;

  for (let s = 0; s < sheetsToProcess.length; s++) {
    const sheetName = sheetsToProcess[s];
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    if (!firstSheet) {
      pdf.addPage();
    }
    firstSheet = false;

    // Sheet Title Header
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(30, 41, 59);
    pdf.text(`Sheet: ${sheetName}`, 40, 40);

    // Convert sheet to 2D array matrix
    const data: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    if (data.length > 0) {
      const headers = data[0].map(h => String(h || ''));
      const rows = data.slice(1).map(row => row.map(cell => String(cell !== undefined && cell !== null ? cell : '')));

      autoTable(pdf, {
        startY: 55,
        head: [headers],
        body: rows,
        margin: { left: 30, right: 30, top: 30, bottom: 30 },
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 4,
          overflow: 'linebreak'
        },
        headStyles: {
          fillColor: [30, 64, 175],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        }
      });
    }

    const percent = Math.round(35 + ((s + 1) / sheetsToProcess.length) * 55);
    onProgress?.(percent, `Generated PDF table for ${sheetName}...`);
  }

  onProgress?.(95, 'Building final PDF output...');
  const pdfBlob = pdf.output('blob');
  onProgress?.(100, 'Excel to PDF conversion complete!');
  return pdfBlob;
}

/**
 * 4. JPG/PNG to PDF conversion (Batch support with reordering)
 */
export async function convertImagesToPdf(
  images: Array<{ file: File; orientation?: 'portrait' | 'landscape' | 'auto' }>,
  options: { pageSize: 'a4' | 'letter' | 'fit'; margin: number },
  onProgress?: (percent: number, message: string) => void
): Promise<Blob> {
  if (images.length === 0) {
    throw new Error('Please select at least one image to convert.');
  }

  let pdf: jsPDF | null = null;

  for (let i = 0; i < images.length; i++) {
    const item = images[i];
    onProgress?.(
      Math.round(((i + 1) / images.length) * 80),
      `Processing image ${i + 1} of ${images.length} (${item.file.name})...`
    );

    // Read image data as Data URL
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error(`Failed to read image ${item.file.name}`));
      reader.readAsDataURL(item.file);
    });

    // Get image dimensions
    const imgObj = await new Promise<{ width: number; height: number }>((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
      img.src = dataUrl;
    });

    const isLandscape = imgObj.width > imgObj.height;

    if (i === 0) {
      if (options.pageSize === 'fit') {
        pdf = new jsPDF({
          orientation: isLandscape ? 'landscape' : 'portrait',
          unit: 'pt',
          format: [imgObj.width, imgObj.height]
        });
      } else {
        pdf = new jsPDF({
          orientation: isLandscape ? 'landscape' : 'portrait',
          unit: 'pt',
          format: options.pageSize
        });
      }
    } else {
      if (options.pageSize === 'fit') {
        pdf!.addPage([imgObj.width, imgObj.height], isLandscape ? 'landscape' : 'portrait');
      } else {
        pdf!.addPage(options.pageSize, isLandscape ? 'landscape' : 'portrait');
      }
    }

    const pageWidth = pdf!.internal.pageSize.getWidth();
    const pageHeight = pdf!.internal.pageSize.getHeight();
    const margin = options.pageSize === 'fit' ? 0 : options.margin;

    const availableWidth = pageWidth - margin * 2;
    const availableHeight = pageHeight - margin * 2;

    const widthRatio = availableWidth / imgObj.width;
    const heightRatio = availableHeight / imgObj.height;
    const bestRatio = Math.min(widthRatio, heightRatio);

    const renderWidth = imgObj.width * bestRatio;
    const renderHeight = imgObj.height * bestRatio;
    const posX = margin + (availableWidth - renderWidth) / 2;
    const posY = margin + (availableHeight - renderHeight) / 2;

    const imgFormat = item.file.type.includes('png') ? 'PNG' : 'JPEG';
    pdf!.addImage(dataUrl, imgFormat, posX, posY, renderWidth, renderHeight, undefined, 'FAST');
  }

  onProgress?.(95, 'Assembling multi-page PDF document...');
  const pdfBlob = pdf!.output('blob');
  onProgress?.(100, 'Images successfully converted to PDF!');
  return pdfBlob;
}
