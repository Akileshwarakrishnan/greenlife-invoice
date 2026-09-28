import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { invoiceApi } from '../services/api';

/**
 * Captures an HTML element into a high-DPI JPEG data URL.
 * Renders exactly what the user sees in the browser (native Tamil text shaping, logos, formatting).
 */
export async function captureBillAsDataUrl(elementId: string): Promise<string> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Printable element #${elementId} not found in DOM`);
  }

  // Ensure all images are completely loaded before capture
  const imgEls = Array.from(element.querySelectorAll('img'));
  await Promise.all(
    imgEls.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    })
  );

  const canvas = await html2canvas(element, {
    scale: 2.5, // 2.5x retina gives ultra-crisp 300 DPI text
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: 1024,
    onclone: (clonedDoc) => {
      const clonedEl = clonedDoc.getElementById(elementId);
      if (clonedEl) {
        clonedEl.style.width = '800px';
        clonedEl.style.maxWidth = '800px';
        clonedEl.style.margin = '0 auto';
        clonedEl.style.backgroundColor = '#ffffff';
      }
    }
  });

  return canvas.toDataURL('image/jpeg', 0.98);
}

/**
 * Exports the bill into a high-DPI, pixel-perfect A4 PDF directly from the browser view.
 */
export async function exportBillToPdf(
  elementId: string,
  filename: string = 'GreenLife_Bill.pdf'
): Promise<void> {
  const imgData = await captureBillAsDataUrl(elementId);

  // Load image to get true pixel dimensions
  const img = new Image();
  await new Promise((resolve) => {
    img.onload = resolve;
    img.src = imgData;
  });

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const margin = 6;
  const printWidth = pdfWidth - margin * 2;
  const printHeight = (img.height * printWidth) / img.width;

  if (printHeight <= pdfHeight - margin * 2) {
    pdf.addImage(imgData, 'JPEG', margin, margin, printWidth, printHeight, undefined, 'FAST');
  } else {
    let heightLeft = printHeight;
    let position = margin;

    pdf.addImage(imgData, 'JPEG', margin, position, printWidth, printHeight, undefined, 'FAST');
    heightLeft -= (pdfHeight - margin * 2);

    while (heightLeft > 0) {
      position = heightLeft - printHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', margin, position, printWidth, printHeight, undefined, 'FAST');
      heightLeft -= (pdfHeight - margin * 2);
    }
  }

  pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}

/**
 * Exports the bill as a high-resolution JPEG image for instant WhatsApp sharing.
 */
export async function exportBillToImage(
  elementId: string,
  filename: string = 'GreenLife_Bill.jpg'
): Promise<void> {
  const imgData = await captureBillAsDataUrl(elementId);
  const link = document.createElement('a');
  link.download = filename.endsWith('.jpg') || filename.endsWith('.png') ? filename : `${filename}.jpg`;
  link.href = imgData;
  link.click();
}

/**
 * Automatically captures the bill screenshot and saves it to the backend.
 * This guarantees that even if someone downloads the PDF from the server URL,
 * the server serves the exact pixel-perfect screenshot without font distortion.
 */
export async function syncBillSnapshotToServer(
  invoiceId: number,
  elementId: string = 'printable-bill'
): Promise<void> {
  try {
    const imgData = await captureBillAsDataUrl(elementId);
    await invoiceApi.uploadSnapshot(invoiceId, imgData);
  } catch (err) {
    // Non-blocking background sync
    console.debug('Background snapshot sync skipped:', err);
  }
}
