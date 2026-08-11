/**
 * Certificate design tokens and inline SVG artwork.
 *
 * The certificate is rendered at this logical size for both the browser
 * preview and export. Keeping one source of truth prevents PDF drift.
 */

export const COLORS = {
  primaryGreen: '#0B5D3B',
  secondaryGreen: '#1E7A52',
  gold: '#C9A227',
  darkGold: '#A67C00',
  background: '#FAFAF7',
  bodyText: '#222222',
  white: '#FFFFFF',
  goldMuted: 'rgba(201, 162, 39, 0.28)',
  watermark: 'rgba(11, 93, 59, 0.035)',
  greenLight: 'rgba(11, 93, 59, 0.06)',
} as const;

export const FONTS = {
  googleFontsUrl:
    'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Dancing+Script:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap',
  families: {
    serif: '"Cinzel", Georgia, "Times New Roman", serif',
    serifAlt: '"Cormorant Garamond", Georgia, "Times New Roman", serif',
    sans: '"Inter", "Helvetica Neue", Arial, sans-serif',
    script: '"Dancing Script", "Brush Script MT", cursive',
  } as const,
} as const;

export const DIMENSIONS = {
  aspectRatio: '3 / 2',
  baseWidth: 1536,
  baseHeight: 1024,
  padding: { top: 44, right: 84, bottom: 44, left: 84 },
  outerBorderWidth: 3,
  innerBorderWidth: 1.2,
  borderGap: 13,
  cornerSize: 50,
} as const;

/** A very faint world map / circular watermark behind the content. */
export const WATERMARK_SVG = `<svg viewBox="0 0 900 560" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
  <circle cx="450" cy="280" r="205" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.6"/>
  <ellipse cx="450" cy="280" rx="205" ry="82" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.45"/>
  <ellipse cx="450" cy="280" rx="92" ry="205" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.45"/>
  <path d="M264 238c44-32 70-50 106-37 23 8 35 29 59 30 25 1 35-20 62-17 25 3 40 24 65 27 26 3 45-10 74 5 28 15 46 36 57 63-29 58-88 97-157 104-95 10-181-41-213-121-8-20-10-37-6-54Z" opacity="0.7"/>
  <path d="M350 126c18 16 32 29 32 48 0 17-14 28-11 48 4 27 36 38 40 64 5 30-18 48-12 82 4 25 24 42 48 64" fill="none" stroke="currentColor" stroke-width="3" opacity="0.45"/>
</svg>`;

/** Botanical SVGs are deliberately small and low-opacity so they remain background detail. */
export function cornerVineSVG(corner: 'tl' | 'tr' | 'bl' | 'br'): string {
  const transform = {
    tl: 'rotate(180 110 110)',
    tr: 'scale(-1 1) translate(-220 0)',
    bl: 'none',
    br: 'scale(-1 -1) translate(-220 -220)',
  }[corner];

  return `<svg viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
    <g transform="${transform}">
      <path d="M15 210c20-36 48-67 77-94 30-28 59-48 103-72" fill="none" stroke="#C9A227" stroke-width="2" stroke-linecap="round" opacity="0.42"/>
      <path d="M34 190c30-27 62-45 97-56" fill="none" stroke="#0B5D3B" stroke-width="1.2" stroke-linecap="round" opacity="0.25"/>
      <g fill="#0B5D3B" opacity="0.22">
        <path d="M54 167c-21-8-30-22-26-38 17 2 29 13 26 38Z"/>
        <path d="M75 148c-4-22 5-37 22-45 7 18 0 34-22 45Z"/>
        <path d="M96 129c-19-9-27-24-22-39 17 2 28 15 22 39Z"/>
        <path d="M119 111c-1-21 9-34 25-40 5 17-3 31-25 40Z"/>
        <path d="M143 93c-16-10-22-24-15-37 15 4 23 16 15 37Z"/>
        <path d="M163 77c1-18 11-28 25-31 2 15-6 26-25 31Z"/>
      </g>
      <g fill="#C9A227" opacity="0.55">
        <circle cx="39" cy="177" r="3"/><circle cx="85" cy="140" r="2.5"/>
        <circle cx="127" cy="104" r="2.2"/><circle cx="169" cy="74" r="2"/>
      </g>
    </g>
  </svg>`;
}

export function cornerFlourishSVG(): string {
  return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3h58M3 3v58" stroke="#C9A227" stroke-width="1.2" opacity="0.7"/>
    <path d="M10 4v26c0 13 9 23 22 23h26M4 10h26c13 0 23 9 23 22v26" fill="none" stroke="#A67C00" stroke-width="0.8" opacity="0.62"/>
    <path d="M18 4c3 16 12 25 28 28M4 18c16 3 25 12 28 28" fill="none" stroke="#C9A227" stroke-width="0.8" opacity="0.55"/>
    <circle cx="7" cy="7" r="2.3" fill="#C9A227" opacity="0.8"/>
  </svg>`;
}

export const SECTION_DIVIDER_SVG = `<svg width="180" height="14" viewBox="0 0 180 14" xmlns="http://www.w3.org/2000/svg">
  <line x1="2" y1="7" x2="68" y2="7" stroke="#C9A227" stroke-width="0.8" opacity="0.55"/>
  <line x1="112" y1="7" x2="178" y2="7" stroke="#C9A227" stroke-width="0.8" opacity="0.55"/>
  <circle cx="78" cy="7" r="2" fill="#C9A227" opacity="0.7"/>
  <path d="M90 2l5 5-5 5-5-5 5-5Z" fill="#A67C00" opacity="0.75"/>
  <circle cx="102" cy="7" r="2" fill="#C9A227" opacity="0.7"/>
</svg>`;

/* Kept as a compatibility export for older consumers. New certificates use /logo.jpeg. */
export const LOGO_BADGE_SVG = `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="22" fill="none" stroke="#0B5D3B" stroke-width="2"/><circle cx="24" cy="24" r="16" fill="none" stroke="#C9A227" stroke-width="1"/></svg>`;

export const DEFAULT_TEMPLATE_VALUES = {
  courseTitle: 'Climate & Environmental Literacy Assessment',
  description:
    'and demonstrated outstanding understanding of sustainability, biodiversity conservation, ecosystem restoration, and climate action.',
  topics: [
    'Climate Change',
    'Biodiversity',
    'Sustainability',
    'Restoration',
    'Climate Action',
    'Environmental Conservation',
  ] as string[],
  designation: 'Certified Climate Advocate',
  signerName: 'Leonard Iyamuremye',
  signerTitle: 'Founder & Executive Director',
  organizationName: 'We4Climate',
  verificationDomain: 'https://we4climate.org/verify',
} as const;
