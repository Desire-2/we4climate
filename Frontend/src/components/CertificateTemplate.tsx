import React, { forwardRef } from 'react';
import { COLORS, FONTS, DIMENSIONS, DEFAULT_TEMPLATE_VALUES } from '../config/certificateConfig';
import DecorativeBorder from './certificate/DecorativeBorder';
import CertificateHeader from './certificate/CertificateHeader';
import CertificateBody from './certificate/CertificateBody';
import SkillsSection from './certificate/SkillsSection';
import SignatureSection from './certificate/SignatureSection';
import VerificationSection from './certificate/VerificationSection';

/* ── Types ───────────────────────────────────────────────────────── */

export interface CertificateData {
  recipientName: string;
  courseTitle?: string;
  description?: string;
  topics?: string[];
  designation?: string;
  signerName?: string;
  signerTitle?: string;
  issueDate?: string;
  certificateCode?: string;
  verificationDomain?: string;
  /** Data-URI for a signature image (optional – falls back to cursive text) */
  signatureImage?: string;
  /** Organization name displayed in the body text */
  organizationName?: string;
}

export interface CertificateTemplateProps {
  data: CertificateData;
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
  /** Show fade-in animation (preview only, not for export) */
  animated?: boolean;
}

/* ── Main Component ──────────────────────────────────────────────── */

const CertificateTemplate = forwardRef<HTMLDivElement, CertificateTemplateProps>(
  ({ data, scale = 1, className, style, animated }, ref) => {
    const s = scale;

    const {
      recipientName,
      courseTitle = 'Climate & Environmental Literacy Assessment',
      description = DEFAULT_TEMPLATE_VALUES.description,
      topics = DEFAULT_TEMPLATE_VALUES.topics,
      signerName = DEFAULT_TEMPLATE_VALUES.signerName,
      signerTitle = DEFAULT_TEMPLATE_VALUES.signerTitle,
      issueDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      certificateCode,
      verificationDomain,
      signatureImage = '/signature1.png',
      organizationName = DEFAULT_TEMPLATE_VALUES.organizationName,
    } = data;

    return (
      <div
        ref={ref}
        className={className}
        style={{
          position: 'relative',
          width: DIMENSIONS.baseWidth * s,
          height: DIMENSIONS.baseHeight * s,
          aspectRatio: DIMENSIONS.aspectRatio,
          backgroundColor: COLORS.background,
          overflow: 'hidden',
          fontFamily: FONTS.families.sans,
          color: COLORS.bodyText,
          lineHeight: 1.4,
          boxSizing: 'border-box',
          // A restrained paper-like texture that stays quiet in print.
          backgroundImage: `
            radial-gradient(circle at 18% 22%, rgba(255,255,255,0.78) 0, transparent 38%),
            radial-gradient(circle at 80% 75%, rgba(224,217,193,0.16) 0, transparent 42%),
            repeating-linear-gradient(0deg, rgba(11,93,59,0.012) 0, rgba(11,93,59,0.012) 1px, transparent 1px, transparent 4px)
          `,
          ...(animated
            ? {
                opacity: 0,
                animation: 'certificateFadeIn 0.6s ease forwards',
              }
            : {}),
          ...style,
        }}
      >
        {/* ── Decorative Borders & Watermark ── */}
        <DecorativeBorder scale={s} />

        {/* ── Content Area ── */}
        <div
          style={{
            position: 'relative',
            zIndex: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: '100%',
            padding: `${DIMENSIONS.padding.top * s}px ${DIMENSIONS.padding.right * s}px ${DIMENSIONS.padding.bottom * s}px ${DIMENSIONS.padding.left * s}px`,
            textAlign: 'center',
            boxSizing: 'border-box',
          }}
        >
          {/* ═══ HEADER ═══ */}
          <CertificateHeader scale={s} organizationName={organizationName} />

          {/* ═══ BODY ═══ */}
          <CertificateBody
            scale={s}
            recipientName={recipientName}
            courseTitle={courseTitle}
            description={description}
          />

          {/* ── Skills / Topics ── */}
          <SkillsSection scale={s} topics={topics} />

          {/* ── Footer: centered signature with quiet lower-right verification ── */}
          <div
            style={{
              position: 'relative',
              marginTop: 'auto',
              width: '100%',
              minHeight: 156 * s,
              paddingTop: 16 * s,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', height: '100%' }}>
              <SignatureSection
                scale={s}
                signerName={signerName}
                signerTitle={signerTitle}
                issueDate={issueDate}
                signatureImage={signatureImage}
              />
            </div>

            {/* Verification – right aligned */}
            <div style={{ position: 'absolute', right: 0, bottom: 0, width: '42%' }}>
              <VerificationSection
                scale={s}
                certificateCode={certificateCode}
                verificationDomain={verificationDomain}
                positioned
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
);

CertificateTemplate.displayName = 'CertificateTemplate';

export default CertificateTemplate;
