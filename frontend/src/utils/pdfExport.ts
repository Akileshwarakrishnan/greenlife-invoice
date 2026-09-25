import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Exports any HTML element (like BillTemplate) into a high-DPI, pixel-perfect A4 PDF.
 * Captures the exact DOM including all Tamil text, logos, custom fonts, icons, and colors.
 */
export async function exportBillToPdf(
  elementId: string,
  filename: string = 'GreenLife_Bill.pdf'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Printable element #${elementId} not found in DOM`);
  }

  // Ensure all images are loaded before capture
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
    scale: 2.5, // 2.5x provides ultra-crisp 300 DPI text without excessive file size
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

  // Calculate A4 dimensions in millimeters
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  // 6mm padding margin around A4
  const margin = 6;
  const printWidth = pdfWidth - margin * 2;
  const printHeight = (canvas.height * printWidth) / canvas.width;

  const imgData = canvas.toDataURL('image/jpeg', 0.98);

  // If content fits on one page (standard retail bill)
  if (printHeight <= pdfHeight - margin * 2) {
    pdf.addImage(imgData, 'JPEG', margin, margin, printWidth, printHeight, undefined, 'FAST');
  } else {
    // Multi-page handling if invoice has dozens of line items
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
 * Exports the bill as a high-resolution JPEG/PNG image for direct WhatsApp sharing.
 */
export async function exportBillToImage(
  elementId: string,
  filename: string = 'GreenLife_Bill.jpg'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Printable element #${elementId} not found in DOM`);
  }

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
    scale: 2.5,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: 1024,
  });

  const link = document.createElement('a');
  link.download = filename.endsWith('.jpg') || filename.endsWith('.png') ? filename : `${filename}.jpg`;
  link.href = canvas.toDataURL('image/jpeg', 0.98);
  link.click();
}
