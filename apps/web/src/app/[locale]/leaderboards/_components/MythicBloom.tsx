/** Breathing prestige bloom rendered behind the #1 (mythic) player card. */
export function MythicBloom() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '90%',
        height: '120%',
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        background:
          'radial-gradient(circle, rgba(236,72,153,0.28) 0%, rgba(251,191,36,0.12) 45%, transparent 72%)',
        filter: 'blur(28px)',
        animation: 'celebration-bloom 3.6s ease-in-out infinite',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
