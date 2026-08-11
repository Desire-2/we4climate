import React from 'react';
import { COLORS, FONTS } from '../../config/certificateConfig';

interface Props {
  scale: number;
  designation: string;
  organizationName?: string;
}

/**
 * Award designation section – displays the earned title (e.g. "Certified
 * Climate Advocate") in a large elegant serif font, dark green, centered.
 */
const AwardSection: React.FC<Props> = ({
  scale: s,
  designation,
  organizationName = 'We4Climate',
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: 4 * s,
      }}
    >
      <p
        style={{
          fontFamily: FONTS.families.sans,
          fontSize: 17 * s,
          fontWeight: 500,
          color: COLORS.bodyText,
          margin: 0,
          letterSpacing: '0.02em',
          opacity: 0.7,
        }}
      >
        Awarded the designation of
      </p>

      <h3
        style={{
          fontFamily: FONTS.families.serifAlt,
          fontSize: 40 * s,
          fontWeight: 700,
          color: COLORS.primaryGreen,
          margin: `${5 * s}px 0 ${2 * s}px`,
          lineHeight: 1.05,
          letterSpacing: '0.01em',
          maxWidth: '90%',
        }}
      >
        {designation}
      </h3>

      <p
        style={{
          fontFamily: FONTS.families.sans,
          fontSize: 16 * s,
          fontWeight: 400,
          color: COLORS.bodyText,
          margin: `${5 * s}px 0 0 0`,
          opacity: 0.82,
        }}
      >
        through the{' '}
        <strong style={{ color: COLORS.primaryGreen, fontWeight: 600 }}>
          {organizationName}
        </strong>{' '}
        Knowledge Hub
      </p>
    </div>
  );
};

export default React.memo(AwardSection);
