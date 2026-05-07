/* Shared icons (inline SVG, no deps) */

const Icon = {
  mail: (p={}) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>
    </svg>
  ),
  discord: (p={}) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" {...p}>
      <path d="M19.27 5.33A17.6 17.6 0 0 0 14.94 4l-.22.41a16.4 16.4 0 0 0-5.45 0L9.05 4a17.7 17.7 0 0 0-4.33 1.33C2 9.27 1.4 13.1 1.7 16.86a17.7 17.7 0 0 0 5.42 2.74l.45-.66a11.6 11.6 0 0 1-1.84-.89l.16-.13a12.6 12.6 0 0 0 12.13 0l.16.13c-.58.35-1.2.65-1.85.9l.45.65a17.7 17.7 0 0 0 5.43-2.74c.36-4.4-.6-8.2-2.95-11.53zM8.52 14.5c-1.05 0-1.92-.97-1.92-2.17 0-1.2.85-2.18 1.92-2.18s1.94.98 1.92 2.18c0 1.2-.85 2.17-1.92 2.17zm6.96 0c-1.05 0-1.92-.97-1.92-2.17 0-1.2.85-2.18 1.92-2.18s1.94.98 1.92 2.18c0 1.2-.85 2.17-1.92 2.17z"/>
    </svg>
  ),
  twitter: (p={}) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" {...p}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  telegram: (p={}) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" {...p}>
      <path d="M21.5 4.5 2.5 12l5.5 2 2 6 3-3.5 5 4 3-15.5zM10 14l-1 4-1.5-5 12-7L10 14z"/>
    </svg>
  ),
  github: (p={}) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" {...p}>
      <path d="M12 2a10 10 0 0 0-3.16 19.5c.5.1.7-.22.7-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.1-1.47-1.1-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.04 1.53 1.04.9 1.52 2.34 1.08 2.91.83.1-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.1.39-2 1.03-2.7-.1-.26-.45-1.28.1-2.66 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.9-1.3 2.74-1.02 2.74-1.02.55 1.38.2 2.4.1 2.66.64.7 1.03 1.6 1.03 2.7 0 3.84-2.34 4.69-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .26.18.58.7.48A10 10 0 0 0 12 2z"/>
    </svg>
  ),
  doc: (p={}) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h6"/>
    </svg>
  ),
  status: (p={}) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 12h4l3-8 4 16 3-8h4"/>
    </svg>
  ),
  send: (p={}) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="m22 2-11 11"/><path d="M22 2 15 22l-4-9-9-4z"/>
    </svg>
  ),
  chev: (p={}) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="m6 9 6 6 6-6"/>
    </svg>
  ),
  globe: (p={}) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>
    </svg>
  ),
  clock: (p={}) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
    </svg>
  ),
  spark: (p={}) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>
    </svg>
  ),
  search: (p={}) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
    </svg>
  ),
};

/* Shared subcomponents */

function StatusPill({ children = "All systems operational" }) {
  return <span className="pill"><span className="dot"/>{children}</span>;
}

function Avatars({ count = 4, online = 3 }) {
  const initials = ["AT", "MK", "SR", "JL", "ND"];
  const palettes = [
    "linear-gradient(135deg,#5eead4,#818cf8)",
    "linear-gradient(135deg,#fbbf24,#f472b6)",
    "linear-gradient(135deg,#38bdf8,#c084fc)",
    "linear-gradient(135deg,#34d399,#22d3ee)",
    "linear-gradient(135deg,#fb7185,#f59e0b)",
  ];
  return (
    <span className="avatars">
      {Array.from({length: count}).map((_, i) => (
        <span key={i} className="ava" style={{background: palettes[i % palettes.length]}}>{initials[i % initials.length]}</span>
      ))}
    </span>
  );
}

function Accordion({ items }) {
  const [open, setOpen] = React.useState(0);
  return (
    <div className="acc">
      {items.map((it, i) => (
        <div key={i} className="acc-item" data-open={open === i ? "true" : "false"}>
          <button className="acc-btn" onClick={() => setOpen(open === i ? -1 : i)}>
            <span>{it.q}</span>
            <span className="chev"><Icon.chev/></span>
          </button>
          <div className="acc-body"><div>{it.a}</div></div>
        </div>
      ))}
    </div>
  );
}

const FAQ_ITEMS = [
  { q: "Can I get a refund on a purchase?", a: "Refund eligibility depends on the item and the time since purchase. Reach out to arcadeum.care@gmail.com with your order ID and we'll get back to you within one business day." },
  { q: "How do I reset my password?", a: "Use the 'Forgot password' link on the sign-in screen. The reset email arrives in about a minute — check spam if it doesn't show up. If your email changed, contact support." },
  { q: "How can I delete my account?", a: "Account deletion is permanent and removes your stats, friends list, and game history. Email arcadeum.care@gmail.com from the address tied to your account to begin the process." },
  { q: "Why is my game laggy in multiplayer?", a: "Most lag is region routing. Switch your matchmaking region in Settings → Network, or check status.arcadeum.games to see if any servers are degraded." },
  { q: "How do I report another player?", a: "Use the in-game ⋯ menu next to the player's name → Report. Our moderation team reviews reports within 24 hours and takes action when our community guidelines are broken." },
];

const CHANNELS = [
  { key: "discord", title: "Discord", sub: "Live community · 12.4k members", icon: <Icon.discord/>, accent: "#5865f2" },
  { key: "twitter", title: "Twitter / X", sub: "@arcadeum · DMs open", icon: <Icon.twitter/>, accent: "#0f1419" },
  { key: "telegram", title: "Telegram", sub: "t.me/arcadeum", icon: <Icon.telegram/>, accent: "#229ed9" },
  { key: "email", title: "Email support", sub: "arcadeum.care@gmail.com", icon: <Icon.mail/>, accent: "#22c55e" },
  { key: "github", title: "GitHub Issues", sub: "Bugs & feature requests", icon: <Icon.github/>, accent: "#8b5cf6" },
  { key: "status", title: "Status page", sub: "All systems operational", icon: <Icon.status/>, accent: "#10b981" },
  { key: "docs", title: "Help center", sub: "120+ articles", icon: <Icon.doc/>, accent: "#f59e0b" },
];

Object.assign(window, { Icon, StatusPill, Avatars, Accordion, FAQ_ITEMS, CHANNELS });
