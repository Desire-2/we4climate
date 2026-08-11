/**
 * QR Code Generator Utility
 *
 * Generates QR code data-URIs for embedding in the certificate.
 * Uses the `qrcode` package for reliable cross-browser canvas rendering.
 */

import * as QRCode from 'qrcode';

/**
 * Generate a QR code as a data-URI string (PNG).
 *
 * @param text - The text/URL to encode
 * @param size - Pixel dimensions (width & height) for the output image
 * @param margin - Quiet zone margin in modules (default 1)
 * @returns Promise resolving to a data-URI string
 */
export async function generateQRCodeDataURL(
  text: string,
  size: number = 200,
  margin: number = 1,
): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: size,
      margin,
      color: {
        dark: '#0B5D3B',
        light: '#FAFAF7',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (error) {
    console.error('QR code generation failed:', error);
    throw new Error('Failed to generate QR code.');
  }
}

/**
 * Generate a QR code as an SVG string. Useful for vector-based PDF output.
 *
 * @param text - The text/URL to encode
 * @param size - Pixel dimensions for the output (default 200)
 * @returns Promise resolving to an SVG string
 */
export async function generateQRCodeSVG(
  text: string,
  size: number = 200,
): Promise<string> {
  try {
    return await QRCode.toString(text, {
      type: 'svg',
      width: size,
      margin: 1,
      color: {
        dark: '#0B5D3B',
        light: '#FAFAF7',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (error) {
    console.error('QR code SVG generation failed:', error);
    throw new Error('Failed to generate QR code SVG.');
  }
}
