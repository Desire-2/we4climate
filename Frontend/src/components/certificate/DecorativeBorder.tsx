import React from 'react';
import { COLORS, DIMENSIONS, cornerVineSVG, cornerFlourishSVG, WATERMARK_SVG } from '../../config/certificateConfig';

interface Props {
  scale: number;
}

/**
 * Premium double-border frame with:
 * - Outer dark-green border
 * - Inner thin gold border
 * - Ornate gold corner flourishes at all four corners
 * - Delicate gold vine/leaf botanical corner decorations (low opacity)
 * - Extremely faint world map watermark centered behind content
 */
const DecorativeBorder: React.FC<Props> = ({ scale: s }) => {
  const cornerSize = DIMENSIONS.cornerSize * s;
  const outerW = DIMENSIONS.outerBorderWidth * s;
  const innerW = DIMENSIONS.innerBorderWidth * s;
  const gap = DIMENSIONS.borderGap * s;
  const cornerInset = outerW + gap;

  return (
    <>
      {/* ── Deep green outer frame and warm paper inset ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: COLORS.primaryGreen,
          borderRadius: 24 * s,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 16 * s,
          backgroundColor: COLORS.background,
          borderRadius: 18 * s,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* ── World Map Watermark ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: COLORS.watermark,
          pointerEvents: 'none',
          zIndex: 1,
          padding: 155 * s,
          opacity: 0.9,
        }}
      >
        <div
          style={{ width: '100%', height: '100%', opacity: 0.7 }}
          dangerouslySetInnerHTML={{ __html: WATERMARK_SVG }}
        />
      </div>

      {/* ── Outer Border ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 24 * s,
          border: `${outerW}px solid ${COLORS.primaryGreen}`,
          pointerEvents: 'none',
          zIndex: 2,
          boxShadow: `inset 0 0 0 ${outerW}px ${COLORS.primaryGreen}`,
        }}
      />

      {/* ── Inner Gold Border ── */}
      <div
        style={{
          position: 'absolute',
          inset: cornerInset + 4 * s,
          borderRadius: 16 * s,
          border: `${innerW}px solid ${COLORS.gold}`,
          pointerEvents: 'none',
          zIndex: 2,
          opacity: 0.8,
        }}
      />

      {/* ── Faint green hairline that gives the frame more depth ── */}
      <div
        style={{
          position: 'absolute',
          inset: outerW + 6 * s,
          borderRadius: 20 * s,
          border: `${0.55 * s}px solid rgba(11,93,59,0.24)`,
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* ── Corner Flourishes (at border intersection) ── */}
      {(['tl', 'tr', 'bl', 'br'] as const).map((pos) => (
        <div
          key={`flourish-${pos}`}
          style={{
            position: 'absolute',
            width: cornerSize,
            height: cornerSize,
            ...(pos === 'tl' ? { top: -2, left: -2 } : {}),
            ...(pos === 'tr' ? { top: -2, right: -2 } : {}),
            ...(pos === 'bl' ? { bottom: -2, left: -2 } : {}),
            ...(pos === 'br' ? { bottom: -2, right: -2 } : {}),
            zIndex: 3,
            pointerEvents: 'none',
          }}
          dangerouslySetInnerHTML={{ __html: cornerFlourishSVG() }}
        />
      ))}

      {/* ── Decorative Vine / Leaf Corner Artwork ── */}
      {(['tl', 'tr', 'bl', 'br'] as const).map((pos) => (
        <div
          key={`vine-${pos}`}
          style={{
            position: 'absolute',
            width: (pos === 'tr' || pos === 'bl' ? 180 : 92) * s,
            height: (pos === 'tr' || pos === 'bl' ? 180 : 92) * s,
            ...(pos === 'tl' ? { top: -8 * s, left: -8 * s } : {}),
            ...(pos === 'tr' ? { top: -8 * s, right: -8 * s } : {}),
            ...(pos === 'bl' ? { bottom: -8 * s, left: -8 * s } : {}),
            ...(pos === 'br' ? { bottom: -8 * s, right: -8 * s } : {}),
            zIndex: 2,
            pointerEvents: 'none',
          }}
          dangerouslySetInnerHTML={{ __html: cornerVineSVG(pos) }}
        />
      ))}
    </>
  );
};

export default React.memo(DecorativeBorder);
