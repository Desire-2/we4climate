import React from 'react';
import { COLORS, FONTS } from '../../config/certificateConfig';

interface Props {
  scale: number;
  recipientName: string;
  courseTitle: string;
  description: string;
}

/** The central statement is kept separate so the certificate can be re-used for other programs. */
const CertificateBody: React.FC<Props> = ({ scale: s, recipientName, courseTitle, description }) => {
  const nameSize = Math.max(46, Math.min(76, 1160 / Math.max(recipientName.length, 17))) * s;
  const courseSize = Math.max(23, Math.min(36, 1160 / Math.max(courseTitle.length, 24))) * s;

  return (
    <section
      aria-label="Certificate achievement"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          fontFamily: FONTS.families.sans,
          fontSize: 19 * s,
          fontWeight: 700,
          letterSpacing: '0.29em',
          color: COLORS.primaryGreen,
          textTransform: 'uppercase',
          margin: 0,
        }}
      >
        This certifies that
      </p>

      <div
        style={{
          width: '64%',
          height: 1,
          backgroundColor: COLORS.gold,
          opacity: 0.65,
          margin: `${12 * s}px 0 ${8 * s}px`,
        }}
      />

      <h2
        style={{
          fontFamily: FONTS.families.serifAlt,
          fontSize: nameSize,
          fontWeight: 700,
          color: COLORS.primaryGreen,
          margin: 0,
          lineHeight: 1.04,
          maxWidth: '82%',
          overflowWrap: 'anywhere',
        }}
      >
        {recipientName}
      </h2>

      <div style={{ maxWidth: '80%', marginTop: 12 * s }}>
        <p
          style={{
            fontFamily: FONTS.families.sans,
            fontSize: 20 * s,
            fontWeight: 400,
            color: COLORS.bodyText,
            margin: 0,
            lineHeight: 1.45,
          }}
        >
          has successfully completed
        </p>
        <p
          style={{
            fontFamily: FONTS.families.sans,
            fontSize: courseSize,
            fontWeight: 700,
            color: COLORS.primaryGreen,
            margin: `${3 * s}px 0 ${5 * s}px`,
            lineHeight: 1.2,
          }}
        >
          {courseTitle}
        </p>
        <p
          style={{
            fontFamily: FONTS.families.sans,
            fontSize: 20 * s,
            fontWeight: 400,
            color: COLORS.bodyText,
            margin: 0,
            lineHeight: 1.45,
          }}
        >
          {description}
        </p>
      </div>
    </section>
  );
};

export default React.memo(CertificateBody);
