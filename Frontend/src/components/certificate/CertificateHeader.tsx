import React from 'react';
import { COLORS, FONTS, SECTION_DIVIDER_SVG } from '../../config/certificateConfig';

interface Props {
  scale: number;
  organizationName?: string;
}

/**
 * Top section of the certificate:
 * - The supplied We4Climate logo + wordmark
 * - Large "CERTIFICATE" in Cinzel serif, letter-spaced
 * - "OF ACHIEVEMENT" flanked by gold rules
 * - Ornate gold divider below
 */
const CertificateHeader: React.FC<Props> = ({ scale: s, organizationName = 'We4Climate' }) => {
  const isWe4Climate = organizationName.toLowerCase() === 'we4climate';

  return (
    <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {/* Logo + Wordmark */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16 * s,
          marginBottom: 12 * s,
        }}
      >
        <div
          style={{
            width: 98 * s,
            height: 98 * s,
            padding: 3 * s,
            border: `${1.2 * s}px solid ${COLORS.gold}`,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.58)',
            boxShadow: `0 0 0 ${2 * s}px rgba(201,162,39,0.10)`,
            flexShrink: 0,
          }}
        >
          <img
            src="/logo.jpeg"
            alt="We4Climate logo"
            crossOrigin="anonymous"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              borderRadius: '50%',
              mixBlendMode: 'multiply',
              display: 'block',
            }}
          />
        </div>
        <span
          style={{
            fontFamily: FONTS.families.sans,
            fontSize: 54 * s,
            fontWeight: 700,
            letterSpacing: '-0.04em',
            color: COLORS.primaryGreen,
            whiteSpace: 'nowrap',
          }}
        >
          {isWe4Climate ? (
            <>
              <span style={{ color: COLORS.bodyText }}>We</span>
              <span style={{ color: COLORS.secondaryGreen }}>4</span>
              <span style={{ color: COLORS.bodyText }}>Climate</span>
            </>
          ) : organizationName}
        </span>
      </div>

      {/* "CERTIFICATE" headline */}
      <h1
        style={{
          fontFamily: FONTS.families.serif,
          fontSize: 94 * s,
          fontWeight: 600,
          letterSpacing: '0.18em',
          color: COLORS.primaryGreen,
          margin: 0,
          lineHeight: 1,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        Certificate
      </h1>

      {/* "OF ACHIEVEMENT" with gold rules */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16 * s,
          marginTop: 9 * s,
        }}
      >
        <div style={{ width: 112 * s, height: 1, backgroundColor: COLORS.gold, opacity: 0.55 }} />
        <span
          style={{
            fontFamily: FONTS.families.sans,
            fontSize: 25 * s,
            fontWeight: 600,
            letterSpacing: '0.34em',
            color: COLORS.darkGold,
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          of Achievement
        </span>
        <div style={{ width: 112 * s, height: 1, backgroundColor: COLORS.gold, opacity: 0.55 }} />
      </div>

      {/* Ornate divider */}
      <div
        style={{
          marginTop: 9 * s,
          marginBottom: 16 * s,
          opacity: 0.8,
          display: 'flex',
          justifyContent: 'center',
        }}
        dangerouslySetInnerHTML={{
          __html: SECTION_DIVIDER_SVG.replace(
            /width="180" height="14"/,
            `width="${180 * s}" height="${14 * s}"`,
          ),
        }}
      />
    </header>
  );
};

export default React.memo(CertificateHeader);
