import type { CSSProperties } from 'react';

export type ContactStyleTokens = {
  accent: string;
  glassBorder: string;
  glassBg: string;
  background: string;
  color: string;
  textSecondary: string;
};

export const buildContactStyles = (t: ContactStyleTokens) => {
  const heroWrapStyle: CSSProperties = {
    position: 'relative',
    borderRadius: 24,
    overflow: 'hidden',
    border: `1px solid ${t.glassBorder}`,
    background:
      `radial-gradient(80% 80% at 50% 100%, rgba(56,189,248,0.18), transparent 70%),` +
      `radial-gradient(60% 60% at 0% 0%, rgba(3,105,161,0.22), transparent 65%),` +
      t.background,
    padding: 'clamp(28px, 5vw, 56px) clamp(20px, 3vw, 32px)',
  };

  const orbStyle = (
    size: number,
    top: string,
    left: string,
    color: string,
  ): CSSProperties => ({
    position: 'absolute',
    width: size,
    height: size,
    top,
    left,
    borderRadius: '50%',
    background: color,
    filter: 'blur(60px)',
    opacity: 0.55,
    pointerEvents: 'none',
  });

  const eyebrowStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 12px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: t.accent,
    border: `1px solid ${t.glassBorder}`,
    background: t.glassBg,
  };

  const eyebrowDotStyle: CSSProperties = {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: t.accent,
    boxShadow: `0 0 8px ${t.accent}`,
  };

  const pillStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    borderRadius: 999,
    fontSize: 13,
    color: t.color,
    border: `1px solid ${t.glassBorder}`,
    background: t.glassBg,
  };

  const heroTitleStyle: CSSProperties = {
    fontSize: 'clamp(40px, 6vw, 60px)',
    fontWeight: 700,
    letterSpacing: '-0.035em',
    lineHeight: 1.05,
    margin: '0 0 16px',
  };

  const titleAccentStyle: CSSProperties = {
    background: `linear-gradient(120deg, ${t.accent} 0%, #f472b6 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    filter: 'drop-shadow(0 0 24px rgba(56,189,248,0.4))',
  };

  const heroTaglineStyle: CSSProperties = {
    maxWidth: 600,
    fontSize: 18,
    lineHeight: 1.55,
    color: t.textSecondary,
    margin: 0,
  };

  const statStripStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: 1,
    background: t.glassBorder,
    border: `1px solid ${t.glassBorder}`,
    borderRadius: 16,
    overflow: 'hidden',
  };

  const statCellWrap: CSSProperties = { background: t.background };

  const tilesGridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 12,
  };

  const sideStackStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  };

  const ruleStyle: CSSProperties = {
    border: 'none',
    height: 1,
    background: t.glassBorder,
    margin: '12px 0',
  };

  const sideRowStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 13.5,
  };

  const labelChipStyle: CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: t.textSecondary,
  };

  const externalIssueLinkStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    padding: '10px 14px',
    borderRadius: 12,
    border: `1px solid ${t.glassBorder}`,
    background: t.glassBg,
    color: t.color,
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
  };

  const formCardInnerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  };

  const formHeaderStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  };

  const formGridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 16,
  };

  const submitRowStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap-reverse',
    gap: 12,
    marginTop: 4,
  };

  const privacyStyle: CSSProperties = {
    fontSize: 12.5,
    color: t.textSecondary,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  };

  const successCardStyle: CSSProperties = {
    textAlign: 'center',
    padding: '40px 24px',
  };

  const burstStyle: CSSProperties = {
    fontSize: 28,
    color: t.accent,
    marginBottom: 8,
  };

  const faqHeaderRowStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  };

  const faqItemStyle = (open: boolean): CSSProperties => ({
    borderBottom: `1px solid ${t.glassBorder}`,
    paddingBottom: open ? 16 : 0,
  });

  const faqButtonStyle: CSSProperties = {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '14px 0',
    background: 'transparent',
    border: 'none',
    color: t.color,
    fontSize: 15,
    fontWeight: 600,
    textAlign: 'left',
    cursor: 'pointer',
    fontFamily: 'inherit',
  };

  const faqAnswerStyle: CSSProperties = {
    fontSize: 14,
    lineHeight: 1.55,
    color: t.textSecondary,
  };

  const chevronStyle = (open: boolean): CSSProperties => ({
    display: 'inline-block',
    transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
    transition: 'transform 200ms ease',
  });

  const helpLinkStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 14px',
    borderRadius: 12,
    border: `1px solid ${t.glassBorder}`,
    background: t.glassBg,
    color: t.color,
    textDecoration: 'none',
    fontSize: 13.5,
  };

  return {
    tokens: t,
    heroWrapStyle,
    orbStyle,
    eyebrowStyle,
    eyebrowDotStyle,
    pillStyle,
    heroTitleStyle,
    titleAccentStyle,
    heroTaglineStyle,
    statStripStyle,
    statCellWrap,
    tilesGridStyle,
    sideStackStyle,
    ruleStyle,
    sideRowStyle,
    labelChipStyle,
    externalIssueLinkStyle,
    formCardInnerStyle,
    formHeaderStyle,
    formGridStyle,
    submitRowStyle,
    privacyStyle,
    successCardStyle,
    burstStyle,
    faqHeaderRowStyle,
    faqItemStyle,
    faqButtonStyle,
    faqAnswerStyle,
    chevronStyle,
    helpLinkStyle,
  };
};

export type ContactStyles = ReturnType<typeof buildContactStyles>;
