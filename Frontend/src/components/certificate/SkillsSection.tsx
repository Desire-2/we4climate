import React from 'react';
import { COLORS, FONTS } from '../../config/certificateConfig';

interface Props {
  scale: number;
  topics: string[];
}

const LeafMark: React.FC<{ scale: number }> = ({ scale: s }) => (
  <svg width={17 * s} height={17 * s} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 2C12 2 6 8 6 14C6 17.3 8.7 20 12 20C15.3 20 18 17.3 18 14C18 8 12 2 12 2Z" fill={COLORS.primaryGreen} opacity="0.9" />
    <path d="M12 6C12 6 9 10 9 13.5C9 15.4 10.3 17 12 17C13.7 17 15 15.4 15 13.5C15 10 12 6 12 6Z" fill={COLORS.gold} opacity="0.75" />
  </svg>
);

/** A clean two-row knowledge list matching the editorial reference layout. */
const SkillsSection: React.FC<Props> = ({ scale: s, topics }) => {
  if (!topics || topics.length === 0) return null;

  const rows: string[][] = [];
  for (let i = 0; i < topics.length; i += 3) rows.push(topics.slice(i, i + 3));

  return (
    <section
      aria-label="Skills demonstrated"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 9 * s,
        margin: `${26 * s}px auto ${18 * s}px`,
        maxWidth: '88%',
      }}
    >
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            rowGap: 5 * s,
          }}
        >
          {row.map((topic, index) => (
            <React.Fragment key={`${rowIndex}-${topic}`}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6 * s,
                  fontFamily: FONTS.families.sans,
                  fontSize: 19 * s,
                  fontWeight: 500,
                  color: COLORS.bodyText,
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                }}
              >
                <LeafMark scale={s} />
                <span>{topic}</span>
              </div>
              {index < row.length - 1 && (
                <span
                  aria-hidden="true"
                  style={{
                    color: COLORS.gold,
                    fontSize: 22 * s,
                    fontWeight: 300,
                    lineHeight: 1,
                    margin: `0 ${12 * s}px`,
                    opacity: 0.78,
                  }}
                >
                  |
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      ))}
    </section>
  );
};

export default React.memo(SkillsSection);
