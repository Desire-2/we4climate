import React from 'react';
import { COLORS, FONTS } from '../../config/certificateConfig';

interface Props {
  scale: number;
  signerName: string;
  signerTitle: string;
  issueDate: string;
  /** Optional data-URI of a signature image to use instead of script text */
  signatureImage?: string;
}

/**
 * Elegant signature block:
 * Signature, signer identity and issued date in one aligned footer block.
 */
const SignatureSection: React.FC<Props> = ({
  scale: s,
  signerName,
  signerTitle,
  issueDate,
  signatureImage,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '34%',
        minWidth: 205 * s,
        maxWidth: 360 * s,
      }}
    >
      {/* Signature (image or cursive text) */}
      {signatureImage ? (
        <img
          src={signatureImage}
          alt={`Signature of ${signerName}`}
          style={{
            height: 34 * s,
            width: 'auto',
            maxWidth: '100%',
            objectFit: 'contain',
            marginBottom: 3 * s,
          }}
        />
      ) : (
        <span
          style={{
            fontFamily: FONTS.families.script,
            fontSize: 37 * s,
            fontWeight: 600,
            color: COLORS.primaryGreen,
            lineHeight: 1,
            marginBottom: 2 * s,
            letterSpacing: '0.02em',
          }}
        >
          {signerName}
        </span>
      )}

      {/* Rule line */}
      <div
        style={{
          width: '100%',
          height: 1,
          backgroundColor: COLORS.gold,
          opacity: 0.8,
          marginBottom: 4 * s,
        }}
      />

      {/* Signer name (bold) */}
      <span
        style={{
          fontFamily: FONTS.families.sans,
          fontSize: 15 * s,
          fontWeight: 700,
          color: COLORS.primaryGreen,
          letterSpacing: '0.02em',
        }}
      >
        {signerName}
      </span>

      {/* Signer title */}
      <span
        style={{
          fontFamily: FONTS.families.sans,
          fontSize: 14 * s,
          fontWeight: 400,
          color: COLORS.bodyText,
          opacity: 0.75,
          letterSpacing: '0.01em',
          marginTop: 0,
        }}
      >
        {signerTitle}
      </span>

      {/* Issue date */}
      <span
        style={{
          fontFamily: FONTS.families.sans,
          fontSize: 13 * s,
          fontWeight: 400,
          color: COLORS.bodyText,
          opacity: 0.7,
          marginTop: 5 * s,
          letterSpacing: '0.02em',
        }}
      >
        Issued: {issueDate}
      </span>
    </div>
  );
};

export default React.memo(SignatureSection);
