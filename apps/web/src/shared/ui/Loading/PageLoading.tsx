import { memo } from 'react';

/**
 * Localized version of PageLoading to resolve Turbopack module factory errors.
 * This component is used in dynamic loading states to ensure stable instantiation.
 */

export interface PageLoadingProps {
  layout?: 'standard' | 'stats' | 'grid' | 'room' | 'auth' | 'home';
}

const s = {
  page: {
    minHeight: '100vh',
    padding: '20px',
    paddingTop: '32px',
    backgroundColor: '#151718',
    width: '100%',
    fontFamily: 'inherit',
    boxSizing: 'border-box' as const,
  },
  container: {
    maxWidth: 1400,
    width: '100%',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 32,
    paddingTop: 32,
  },
  header: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 16,
    width: '100%',
  },
  row: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 16,
    width: '100%',
  },
  col: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 16,
    width: '100%',
  },
  glass: {
    backgroundColor: 'rgba(15, 17, 18, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    padding: 28,
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  glassLine: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    pointerEvents: 'none' as const,
    background:
      'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.16) 50%, transparent 100%)',
  },
} as const;

function Skel({
  w = '100%',
  h = 20,
  round,
  delay = 0,
  style,
}: {
  w?: string | number;
  h?: string | number;
  round?: boolean;
  delay?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: round ? '50%' : 8,
        backgroundColor: '#32353d',
        opacity: 0.5,
        animation: 'pl-pulse 1.8s ease-in-out infinite',
        animationDelay: `${delay}s`,
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

function Glass({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ ...s.glass, ...style }}>
      <div style={s.glassLine} />
      {children}
    </div>
  );
}

function GridLayout() {
  return (
    <div style={s.row}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Glass
          key={i}
          style={{ width: 300, flexGrow: 1, height: 200, padding: 0 }}
        >
          <Skel
            w="100%"
            h="100%"
            delay={0.2 + i * 0.05}
            style={{ borderRadius: 0 }}
          />
        </Glass>
      ))}
    </div>
  );
}

function StandardLayout() {
  return (
    <div style={{ ...s.col, maxWidth: 900 }}>
      <Glass style={{ minHeight: 400 }}>
        <div style={{ ...s.col, gap: 20 }}>
          <Skel w="30%" h={24} delay={0.3} />
          <div style={{ ...s.col, gap: 12 }}>
            <Skel w="100%" h={16} delay={0.35} />
            <Skel w="100%" h={16} delay={0.4} />
            <Skel w="80%" h={16} delay={0.45} />
          </div>
          <Skel w="100%" h={200} delay={0.5} />
        </div>
      </Glass>
    </div>
  );
}

function StatsLayout() {
  return (
    <div style={{ ...s.col, gap: 24 }}>
      <div style={s.row}>
        {[1, 2, 3].map((i) => (
          <Glass key={i} style={{ flex: 1, minWidth: 200, height: 120 }}>
            <div style={{ ...s.col, gap: 8 }}>
              <Skel w="40%" h={12} delay={0.2 + i * 0.1} />
              <Skel w="80%" h={32} delay={0.3 + i * 0.1} />
            </div>
          </Glass>
        ))}
      </div>
      <Glass style={{ height: 400 }}>
        <Skel w="100%" h="100%" delay={0.6} />
      </Glass>
    </div>
  );
}

function RoomLayout() {
  return (
    <div style={{ ...s.row, height: 600, flexWrap: 'nowrap' }}>
      <div style={{ flex: 2, height: '100%' }}>
        <Glass
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Skel w={120} h={120} round delay={0.3} />
          <Skel w="40%" h={24} delay={0.4} style={{ marginTop: 16 }} />
        </Glass>
      </div>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          height: '100%',
        }}
      >
        <Glass style={{ flex: 1 }}>
          <Skel w="100%" h="100%" delay={0.5} />
        </Glass>
        <Glass style={{ flex: 1 }}>
          <Skel w="100%" h="100%" delay={0.6} />
        </Glass>
      </div>
    </div>
  );
}

function AuthLayout() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        paddingTop: 40,
      }}
    >
      <Glass
        style={{
          width: 450,
          maxWidth: '100%',
          padding: 32,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Skel w={80} h={80} round delay={0.2} style={{ marginBottom: 24 }} />
        <Skel w="70%" h={40} delay={0.3} style={{ marginBottom: 16 }} />
        <Skel w="50%" h={16} delay={0.4} style={{ marginBottom: 32 }} />
        <div style={{ ...s.col, gap: 16, width: '100%' }}>
          <Skel w="100%" h={48} delay={0.5} />
          <Skel w="100%" h={48} delay={0.6} />
          <Skel w="40%" h={16} delay={0.7} style={{ alignSelf: 'center' }} />
        </div>
      </Glass>
    </div>
  );
}

function HomeLayout() {
  return (
    <div style={{ ...s.col, gap: 0 }}>
      {/* Hero section */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 48,
          padding: '60px 0 80px',
          flexWrap: 'wrap',
        }}
      >
        {/* Hero text side */}
        <div style={{ ...s.col, flex: 1, minWidth: 280, gap: 20 }}>
          <Skel w={180} h={28} delay={0.1} style={{ borderRadius: 14 }} />
          <Skel w="80%" h={64} delay={0.15} />
          <Skel w="90%" h={20} delay={0.2} />
          <div style={{ ...s.col, gap: 8 }}>
            <Skel w="100%" h={16} delay={0.25} />
            <Skel w="70%" h={16} delay={0.3} />
          </div>
          <div style={{ ...s.row, gap: 12, marginTop: 8 }}>
            <Skel w={140} h={48} delay={0.35} style={{ borderRadius: 12 }} />
            <Skel w={160} h={48} delay={0.4} style={{ borderRadius: 12 }} />
          </div>
        </div>
        {/* Hero card stack side */}
        <div
          style={{
            flex: 1,
            minWidth: 250,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 320,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                position: i === 0 ? 'relative' : 'absolute',
                width: 180,
                height: 260,
                borderRadius: 16,
                backgroundColor: '#32353d',
                opacity: 0.3 + i * 0.15,
                transform: `rotate(${(i - 1) * 12}deg) translateX(${
                  (i - 1) * 65
                }px)`,
                animation: 'pl-pulse 1.8s ease-in-out infinite',
                animationDelay: `${0.3 + i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>
      {/* Games slider section */}
      <div style={{ ...s.col, gap: 24 }}>
        <div style={{ ...s.col, gap: 8, alignItems: 'center' }}>
          <Skel w={220} h={32} delay={0.5} />
          <Skel w={340} h={18} delay={0.55} />
        </div>
        <div
          style={{ ...s.row, gap: 24, flexWrap: 'nowrap', overflow: 'hidden' }}
        >
          {[1, 2, 3, 4].map((i) => (
            <Glass
              key={i}
              style={{
                minWidth: 340,
                width: 340,
                height: 320,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div
                style={{
                  ...s.row,
                  gap: 12,
                  alignItems: 'center',
                  flexWrap: 'nowrap',
                }}
              >
                <Skel w={48} h={48} round delay={0.6 + i * 0.05} />
                <Skel w="60%" h={24} delay={0.65 + i * 0.05} />
              </div>
              <Skel w="100%" h={16} delay={0.7 + i * 0.05} />
              <Skel w="80%" h={16} delay={0.75 + i * 0.05} />
              <div style={{ ...s.row, gap: 8 }}>
                <Skel
                  w={60}
                  h={24}
                  delay={0.8 + i * 0.05}
                  style={{ borderRadius: 12 }}
                />
                <Skel
                  w={80}
                  h={24}
                  delay={0.85 + i * 0.05}
                  style={{ borderRadius: 12 }}
                />
              </div>
              <div style={{ marginTop: 'auto' }}>
                <Skel
                  w="100%"
                  h={44}
                  delay={0.9 + i * 0.05}
                  style={{ borderRadius: 12 }}
                />
              </div>
            </Glass>
          ))}
        </div>
      </div>
    </div>
  );
}

const layouts: Record<
  NonNullable<PageLoadingProps['layout']>,
  () => React.JSX.Element
> = {
  grid: GridLayout,
  standard: StandardLayout,
  stats: StatsLayout,
  room: RoomLayout,
  auth: AuthLayout,
  home: HomeLayout,
};

export const PageLoading = memo(function PageLoading({
  layout = 'standard',
}: PageLoadingProps) {
  const Layout = layouts[layout];
  return (
    <>
      <style>{`@keyframes pl-pulse{0%,100%{opacity:.5}50%{opacity:.25}}`}</style>
      <div style={s.page}>
        <div style={s.container}>
          <div style={s.header}>
            <Skel w="60%" h={56} delay={0.1} />
            <Skel w="40%" h={20} delay={0.2} />
          </div>
          <Layout />
        </div>
      </div>
    </>
  );
});
