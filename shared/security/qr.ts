import QRCode from 'qrcode'

/**
 * Generates an ISO/IEC 18004 standard QR Code Data URL (PNG base64).
 * Fully compatible with Google Authenticator, Microsoft Authenticator, Apple Passwords,
 * Authy, 1Password, and mobile cameras.
 */
export async function generateQrDataUrl(
  text: string,
  options: { width?: number; margin?: number } = {}
): Promise<string> {
  return await QRCode.toDataURL(text, {
    width: options.width ?? 220,
    margin: options.margin ?? 2,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  })
}

/**
 * Generates an SVG string representation of the QR code.
 */
export async function generateQrSvg(
  text: string,
  options: { width?: number; margin?: number } = {}
): Promise<string> {
  return await QRCode.toString(text, {
    type: 'svg',
    width: options.width ?? 220,
    margin: options.margin ?? 2,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  })
}
