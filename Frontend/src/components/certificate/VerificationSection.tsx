import React, { useEffect, useState } from 'react';
import { COLORS, FONTS } from '../../config/certificateConfig';
import { generateQRCodeDataURL } from '../../utils/qrCodeGenerator';

interface Props {
  scale: number;
  certificateCode?: string;
  verificationDomain?: string;
  /** Anchor the block inside the template's lower-right footer slot. */
  positioned?: boolean;
}

/**
 * Bottom-right verification block:
 * - QR code that encodes the verification URL
 * - Certificate ID
 * - Verification URL text
 *
 * Positioned at the bottom-right of the certificate via the parent's flex layout.
 */
const VerificationSection: React.FC<Props> = ({
  scale: s,
  certificateCode,
  verificationDomain = 'https://we4climate.org/verify',
  positioned = false,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const qrSize = 70 * s;
  const verificationBase = verificationDomain.replace(/\/$/, '');

  useEffect(() => {
    if (!certificateCode) return;
    const url = `${verificationBase}/${certificateCode}`;
    generateQRCodeDataURL(url, Math.round(qrSize * 2)).then(setQrDataUrl).catch(console.error);
  }, [certificateCode, verificationBase, qrSize]);

  if (!certificateCode) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 10 * s,
          width: positioned ? '100%' : '40%',
          minWidth: positioned ? 0 : 260 * s,
          paddingTop: 4 * s,
          opacity: 0.78,
        }}
      >
        <div style={{ textAlign: 'right' }}>
          <span
            style={{
              display: 'block',
              fontFamily: FONTS.families.sans,
              fontSize: 15 * s,
              fontWeight: 700,
              letterSpacing: '0.14em',
              color: COLORS.primaryGreen,
              textTransform: 'uppercase',
            }}
          >
            Verification
          </span>
          <span
            style={{
              display: 'block',
              fontFamily: FONTS.families.sans,
              fontSize: 13 * s,
              color: COLORS.bodyText,
              marginTop: 3 * s,
            }}
          >
            ID assigned on issue
          </span>
        </div>
        <div
          aria-hidden="true"
          style={{
            width: qrSize,
            height: qrSize,
            border: `${1 * s}px dashed ${COLORS.goldMuted}`,
            backgroundColor: COLORS.greenLight,
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10 * s,
        alignSelf: 'flex-end',
        width: positioned ? '100%' : '40%',
        minWidth: positioned ? 0 : 260 * s,
        justifyContent: 'flex-end',
        paddingTop: 4 * s,
      }}
    >
      {/* Certificate ID + URL */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 3 * s,
        }}
      >
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: 15 * s,
            fontWeight: 600,
            color: COLORS.gold,
            letterSpacing: '0.12em',
          }}
        >
          {certificateCode}
        </span>
        <span
          style={{
            fontFamily: FONTS.families.sans,
            fontSize: 13 * s,
            fontWeight: 400,
            color: COLORS.bodyText,
            opacity: 0.68,
            letterSpacing: '0.02em',
            lineHeight: 1.25,
            maxWidth: 320 * s,
            overflowWrap: 'anywhere',
          }}
        >
          {verificationBase}/{certificateCode}
        </span>
      </div>

      {/* QR Code */}
      {qrDataUrl ? (
        <img
          src={qrDataUrl}
          alt="Verification QR Code"
          style={{ width: qrSize, height: qrSize, display: 'block', opacity: 0.92 }}
        />
      ) : (
        <div
          style={{
            width: qrSize,
            height: qrSize,
            backgroundColor: COLORS.greenLight,
            border: `${1 * s}px solid ${COLORS.goldMuted}`,
          }}
        />
      )}
    </div>
  );
};

export default React.memo(VerificationSection);
