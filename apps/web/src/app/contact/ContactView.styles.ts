import type { CSSProperties } from 'react';

export const heroWrapStyle: CSSProperties = {
  position: 'relative',
  borderRadius: 24,
  overflow: 'hidden',
  border: '1px solid var(--glassBorder)',
  background:
    'radial-gradient(80% 80% at 50% 100%, rgba(56,189,248,0.18), transparent 70%), radial-gradient(60% 60% at 0% 0%, rgba(3,105,161,0.22), transparent 65%), var(--background)',
  padding: 'clamp(28px, 5vw, 56px) clamp(20px, 3vw, 32px)',
};

export const orbStyle = (
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

export const eyebrowStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '6px 12px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: 1.2,
  textTransform: 'uppercase',
  color: 'var(--accent)',
  border: '1px solid var(--glassBorder)',
  background: 'var(--glassBg)',
};

export const eyebrowDotStyle: CSSProperties = {
  width: 7,
  height: 7,
  borderRadius: '50%',
  background: 'var(--accent)',
  boxShadow: '0 0 8px var(--accent)',
};

export const pillStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 12px',
  borderRadius: 999,
  fontSize: 13,
  color: 'var(--color)',
  border: '1px solid var(--glassBorder)',
  background: 'var(--glassBg)',
};

export const heroTitleStyle: CSSProperties = {
  fontSize: 'clamp(40px, 6vw, 60px)',
  fontWeight: 700,
  letterSpacing: '-0.035em',
  lineHeight: 1.05,
  margin: '0 0 16px',
};

export const titleAccentStyle: CSSProperties = {
  background: 'linear-gradient(120deg, var(--accent) 0%, #f472b6 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  filter: 'drop-shadow(0 0 24px rgba(56,189,248,0.4))',
};

export const heroTaglineStyle: CSSProperties = {
  maxWidth: 600,
  fontSize: 18,
  lineHeight: 1.55,
  color: 'var(--textSecondary)',
  margin: 0,
};

export const statStripStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
  gap: 1,
  background: 'var(--glassBorder)',
  border: '1px solid var(--glassBorder)',
  borderRadius: 16,
  overflow: 'hidden',
};

export const statCellWrap: CSSProperties = {
  background: 'var(--background)',
};

export const tilesGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 12,
};

export const sideStackStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

export const ruleStyle: CSSProperties = {
  border: 'none',
  height: 1,
  background: 'var(--glassBorder)',
  margin: '12px 0',
};

export const sideRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: 13.5,
};

export const labelChipStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: 1.4,
  textTransform: 'uppercase',
  color: 'var(--textSecondary)',
};

export const externalIssueLinkStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  width: '100%',
  padding: '10px 14px',
  borderRadius: 12,
  border: '1px solid var(--glassBorder)',
  background: 'var(--glassBg)',
  color: 'var(--color)',
  textDecoration: 'none',
  fontSize: 14,
  fontWeight: 500,
};

export const formCardInnerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
  flex: 1,
  minHeight: 0,
};

export const formHeaderStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: 12,
};

export const formGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 16,
};

export const submitRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: 12,
  marginTop: 'auto',
  paddingTop: 4,
};

export const privacyStyle: CSSProperties = {
  fontSize: 12.5,
  color: 'var(--textSecondary)',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
};

export const successCardStyle: CSSProperties = {
  textAlign: 'center',
  padding: '32px 16px',
};

export const burstStyle: CSSProperties = {
  fontSize: 28,
  color: 'var(--accent)',
  marginBottom: 8,
};

export const faqHeaderRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
  gap: 12,
  marginBottom: 8,
};

export const faqItemStyle = (open: boolean): CSSProperties => ({
  borderBottom: '1px solid var(--glassBorder)',
  paddingBottom: open ? 16 : 0,
});

export const faqButtonStyle: CSSProperties = {
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  padding: '14px 0',
  background: 'transparent',
  border: 'none',
  color: 'var(--color)',
  fontSize: 15,
  fontWeight: 600,
  textAlign: 'left',
  cursor: 'pointer',
  fontFamily: 'inherit',
};

export const faqAnswerStyle: CSSProperties = {
  fontSize: 14,
  lineHeight: 1.55,
  color: 'var(--textSecondary)',
};

export const chevronStyle = (open: boolean): CSSProperties => ({
  display: 'inline-block',
  transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
  transition: 'transform 200ms ease',
});

export const helpLinkStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 14px',
  borderRadius: 12,
  border: '1px solid var(--glassBorder)',
  background: 'var(--glassBg)',
  color: 'var(--color)',
  textDecoration: 'none',
  fontSize: 13.5,
};
