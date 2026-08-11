/**
 * Certificate Export Utilities – Premium Edition
 *
 * Provides high-resolution PNG export and print-quality PDF export
 * (300 DPI equivalent) with A4 / Letter landscape support.
 *
 * Uses html-to-image for DOM→canvas capture and jsPDF for PDF generation.
 */

import { toPng, toCanvas } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { COLORS, DIMENSIONS } from '../config/certificateConfig';

/** Default export scale factor (~300 DPI equivalent at 1536 logical px). */
const DEFAULT_SCALE = 3;

export type PageFormat = 'a4' | 'letter';

export interface ExportOptions {
  /** Scale multiplier (3 = ~300 DPI). Default 3. */
  scale?: number;
  /** Filename without extension. Default "We4Climate-Certificate". */
  filename?: string;
  /** Quality for PNG export (0–1). Default 0.95. */
  quality?: number;
  /** Page format for PDF. Default "a4". */
  format?: PageFormat;
}

/**
 * Get standard landscape page dimensions in mm. The 3:2 certificate is fitted
 * inside the page separately so it is never stretched or clipped.
 */
function getPDFDimensions(format: PageFormat): { width: number; height: number; label: string } {
  switch (format) {
    case 'letter':
      return {
        width: 279.4, // Letter landscape mm
        height: 215.9,
        label: 'Letter',
      };
    case 'a4':
    default:
      return {
        width: 297, // A4 landscape mm
        height: 210,
        label: 'A4',
      };
  }
}

function getRenderedSize(element: HTMLElement): { width: number; height: number; scale: number } {
  const rect = element.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width || element.scrollWidth));
  const height = Math.max(1, Math.round(rect.height || element.scrollHeight));
  return {
    width,
    height,
    scale: width / DIMENSIONS.baseWidth,
  };
}

async function waitForCertificateAssets(element: HTMLElement): Promise<void> {
  if (typeof document !== 'undefined' && 'fonts' in document) {
    await document.fonts.ready;
  }

  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(
    images.map(async (image) => {
      if (image.complete) return;
      await new Promise<void>((resolve) => {
        image.addEventListener('load', () => resolve(), { once: true });
        image.addEventListener('error', () => resolve(), { once: true });
      });
    }),
  );
}

function freezePreviewAnimation(element: HTMLElement): () => void {
  const previous = {
    animation: element.style.animation,
    opacity: element.style.opacity,
    transform: element.style.transform,
  };
  element.style.animation = 'none';
  element.style.opacity = '1';
  element.style.transform = 'none';

  return () => {
    element.style.animation = previous.animation;
    element.style.opacity = previous.opacity;
    element.style.transform = previous.transform;
  };
}

/**
 * Export the certificate element as a high-resolution PNG image.
 * Triggers a browser download.
 *
 * At scale=3 and 1536 logical px, the output is ~4608 px wide,
 * equivalent to ~300 DPI at A4 landscape size.
 */
export async function exportToPNG(
  element: HTMLElement,
  options: ExportOptions = {},
): Promise<void> {
  const scale = options.scale ?? DEFAULT_SCALE;
  const filename = options.filename ?? 'We4Climate-Certificate';
  const quality = options.quality ?? 0.95;

  const restoreAnimation = freezePreviewAnimation(element);
  try {
    await waitForCertificateAssets(element);
    const rendered = getRenderedSize(element);
    const pixelRatio = scale / Math.max(rendered.scale, 0.01);
    const dataUrl = await toPng(element, {
      width: rendered.width,
      height: rendered.height,
      pixelRatio,
      quality,
      cacheBust: true,
    });

    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('PNG export failed:', error);
    throw new Error('Failed to export certificate as PNG.');
  } finally {
    restoreAnimation();
  }
}

/**
 * Export the certificate element as a print-quality PDF.
 * - Landscape orientation
 * - Choose between A4 and Letter formats
 * - PNG is embedded at full resolution for crisp printing
 */
export async function exportToPDF(
  element: HTMLElement,
  options: ExportOptions = {},
): Promise<void> {
  const scale = options.scale ?? DEFAULT_SCALE;
  const filename = options.filename ?? 'We4Climate-Certificate';
  const format = options.format ?? 'a4';

  const restoreAnimation = freezePreviewAnimation(element);
  try {
    await waitForCertificateAssets(element);
    const rendered = getRenderedSize(element);
    const pixelRatio = scale / Math.max(rendered.scale, 0.01);
    const canvas = await toCanvas(element, {
      width: rendered.width,
      height: rendered.height,
      pixelRatio,
      cacheBust: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const { width: pdfWidth, height: pdfHeight, label } = getPDFDimensions(format);
    const contentWidth = Math.min(pdfWidth, (pdfHeight * DIMENSIONS.baseWidth) / DIMENSIONS.baseHeight);
    const contentHeight = (contentWidth * DIMENSIONS.baseHeight) / DIMENSIONS.baseWidth;
    const contentX = (pdfWidth - contentWidth) / 2;
    const contentY = (pdfHeight - contentHeight) / 2;

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format,
      compress: true,
    });

    pdf.setFillColor(COLORS.background);
    pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
    pdf.addImage(imgData, 'PNG', contentX, contentY, contentWidth, contentHeight, undefined, 'FAST');
    pdf.setProperties({
      title: `${filename} — ${label}`,
      subject: 'We4Climate Certificate of Achievement',
      author: 'We4Climate',
    });
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('PDF export failed:', error);
    throw new Error('Failed to export certificate as PDF.');
  } finally {
    restoreAnimation();
  }
}
