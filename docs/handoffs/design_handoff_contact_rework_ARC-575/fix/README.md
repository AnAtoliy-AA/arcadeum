# PR #582 — Fix Pack (ARC-575 follow-up)

Concrete patches for each issue raised in code review. Apply in order; each is independent.

---

## 🔴 1. Resolve theme CSS vars via `useTheme()`

**Why:** `var(--accent)`, `var(--glassBorder)`, `var(--glassBg)`, `var(--background)`, `var(--color)`, `var(--textSecondary)` in `ContactView.styles.ts` are not Tamagui's emitted variable names. They render empty in every theme.

### Step 1a — convert `ContactView.styles.ts` from constants to a factory

Replace the file with a function that takes a resolved theme and returns the same style objects, with real color strings.

```ts
// apps/web/src/app/contact/ContactView.styles.ts
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

  // ↓ NIT #10 fix: stack on narrow viewports so privacy sits below the CTA
  const submitRowStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap-reverse', // privacy under button when wrapped
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

  // ↓ NIT #9 fix: match outer card padding rhythm
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
```

### Step 1b — small `useContactStyles()` hook

```ts
// apps/web/src/app/contact/useContactStyles.ts
'use client';
import { useTheme } from 'tamagui';
import { buildContactStyles } from './ContactView.styles';

export function useContactStyles() {
  const theme = useTheme();
  // Tamagui's useTheme returns Variable objects — use .val for the resolved string.
  const get = (key: string, fallback: string) =>
    (theme as any)[key]?.val ?? fallback;

  return buildContactStyles({
    accent: get('accent', '#38bdf8'),
    glassBorder: get('glassBorder', 'rgba(255,255,255,0.1)'),
    glassBg: get('glassBg', 'rgba(15,17,18,0.8)'),
    background: get('background', '#151718'),
    color: get('color', '#ecefee'),
    textSecondary: get('textSecondary', '#8e9196'),
  });
}
```

### Step 1c — call the hook in `ContactView.tsx`, `ContactSidePanel.tsx`, `ContactFaq.tsx`

Replace each top-level `import { … } from './ContactView.styles'` of style **constants** with a single hook call inside the component body:

```tsx
// ContactView.tsx
import { useContactStyles } from './useContactStyles';

export default function ContactView({ … }) {
  const s = useContactStyles();
  // …everywhere you used `heroWrapStyle`, use `s.heroWrapStyle`, etc.
}
```

Same for `ContactSidePanel` and `ContactFaq`. Pass `s` down as a prop or call the hook inside each.

---

## 🔴 2. `ContactAvatars` border color

Resolve `--background` via the hook too.

```tsx
// ContactAvatars.tsx (top of file)
'use client';
import { useTheme } from 'tamagui';

export function ContactAvatars({
  count = 3,
  size = 24,
  borderColor,
}: ContactAvatarsProps) {
  const theme = useTheme();
  const resolvedBorder =
    borderColor ?? (theme.background as any)?.val ?? '#151718';
  // …pass `resolvedBorder` into avatarStyle(size, i, resolvedBorder)
}
```

---

## 🔴 3. Light-theme avatar contrast

Pick text color based on theme luminance.

```tsx
// ContactAvatars.tsx — adjust avatarStyle
const avatarStyle = (
  size: number,
  index: number,
  borderColor: string,
  fg: string,
): CSSProperties => ({
  // …rest unchanged
  color: fg, // was hard-coded '#0b1018'
});

// inside ContactAvatars():
const isLight =
  (theme.color as any)?.val?.startsWith?.('#0') ||
  (theme.color as any)?.val?.startsWith?.('#1');
const fg = isLight ? '#0b1018' : '#0b1018'; // dark text on bright gradients reads fine
// If you want pure-light themes to swap, gate on theme name instead:
// const fg = ['light','tealLight','violetLight','neonLight'].includes(themeName) ? '#0b1018' : '#0b1018';
```

In practice the gradients (cyan/pink/lime) are bright enough that `#0b1018` works on every theme — verify in preview, only swap if visibly low.

---

## 🟡 4. Stat strip + Discord member count → i18n

### i18n keys — add to all 5 locale files

```json
// en/legal/contact.json (snippet)
{
  "sections": {
    "stats": {
      "ticketsResolvedValue": "2,840",
      "avgRatingValue": "4.9 ★",
      "languagesSupportedValue": "5",
      "slaHitValue": "98%"
    },
    "channels": {
      "discord": {
        "sub": "{{count}} members online"
      }
    }
  }
}
```

### `ContactView.tsx`

```tsx
const channelDefs = [
  {
    key: 'discord',
    icon: <DiscordIcon />,
    title: channels?.discord?.title ?? 'Discord',
    sub: formatMessage(channels?.discord?.sub, {
      count: channels?.discord?.memberCount ?? '12.4k',
    }),
    // …
  },
  // …
];

// stat strip
<StatTile value={stats?.ticketsResolvedValue ?? '2,840'} label={…} />
<StatTile value={stats?.avgRatingValue ?? '4.9 ★'} label={…} />
<StatTile value={stats?.languagesSupportedValue ?? '5'} label={…} />
<StatTile value={stats?.slaHitValue ?? '98%'} label={…} />
```

When the BE module lands, swap defaults for live data via TanStack Query.

---

## 🟡 5 & 6. On-call names + side-panel meta strings

### i18n keys

```json
{
  "sections": {
    "hero": {
      "onCallNames": "Maria, Anatoliy +{{extra}}"
    },
    "side": {
      "onCallTeam": "Maria, Anatoliy +{{extra}}",
      "onCallRegion": "Support · EU + LATAM",
      "coverageValue": "GMT-5 → GMT+8",
      "medianFirstReplyValue": "4 hr"
    }
  }
}
```

### `ContactSidePanel.tsx`

```tsx
<Typography fontWeight="700">
  {formatMessage(side?.onCallTeam, { extra: '2' }) ?? 'Maria, Anatoliy +2'}
</Typography>
<Typography variant="caption" alpha="medium">
  {side?.onCallRegion ?? 'Support · EU + LATAM'}
</Typography>
{/* … */}
<Typography fontWeight="700">
  {side?.medianFirstReplyValue ?? '4 hr'}
</Typography>
{/* … */}
<Typography fontWeight="700">
  {side?.coverageValue ?? 'GMT-5 → GMT+8'}
</Typography>
```

(GMT strings are technically locale-neutral but go through i18n anyway — RU/ES/FR may want different formatting.)

---

## 🟡 7. Document `maxLength=1200` for the BE module

Add a one-liner to the contact handoff README under **API contract (future)**:

```md
- `POST /api/contact` body: `{ name, email, subject, message }`
  - `name` — 1..120 chars
  - `email` — RFC 5322
  - `subject` — 1..200 chars
  - `message` — 1..1200 chars ← matches FloatingLabelTextArea maxLength
```

When you scaffold `apps/be/src/modules/support`, mirror the limits in the DTO with `class-validator` (`@MaxLength(1200)`).

---

## 🟢 8. Unbalanced layout @ 1280+

Already handled by the flex-stretch revert. Spot-check in Vercel preview at 1280 / 1440 / 1920 — if the form card looks "floating" because the side panel runs much longer, add a soft visual continuation:

```tsx
// Form GlassCard — purely cosmetic, optional
<YStack flex={1.6} minWidth={0} marginBottom="$4">
  <GlassCard>…</GlassCard>
</YStack>
```

…or leave as-is per the handoff allowance.

---

## 🟢 9 & 10. Already inlined above

- `successCardStyle` padding bumped `32 16 → 40 24`.
- `submitRowStyle` switched `flexWrap: 'wrap' → 'wrap-reverse'` so privacy text drops _below_ the Launch button on narrow viewports.

---

## 🟢 11. Add unit tests

### `ContactFaq.test.tsx`

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ContactFaq, getFaqItems } from './ContactFaq';

const items = [
  { key: 'refund', question: 'Refunds?', answerTemplate: 'Email {{email}}.' },
  { key: 'pwd', question: 'Forgot password?', answerTemplate: 'Reset link.' },
];

describe('ContactFaq', () => {
  it('opens the first item by default', () => {
    render(<ContactFaq items={items} supportEmail="hi@arc.games" />);
    expect(screen.getByText(/Email/)).toBeInTheDocument();
  });

  it('renders the email as a real mailto: anchor', () => {
    render(<ContactFaq items={items} supportEmail="hi@arc.games" />);
    const link = screen.getByRole('link', { name: 'hi@arc.games' });
    expect(link).toHaveAttribute('href', 'mailto:hi@arc.games');
  });

  it('is single-open (clicking another closes the first)', () => {
    render(<ContactFaq items={items} supportEmail="x@y.z" />);
    fireEvent.click(screen.getByRole('button', { name: /Forgot password/ }));
    expect(screen.queryByText(/Email/)).not.toBeInTheDocument();
    expect(screen.getByText('Reset link.')).toBeInTheDocument();
  });

  it('toggles closed when clicking the open item', () => {
    render(<ContactFaq items={items} supportEmail="x@y.z" />);
    fireEvent.click(screen.getByRole('button', { name: /Refunds/ }));
    expect(screen.queryByText(/Email/)).not.toBeInTheDocument();
  });
});

describe('getFaqItems', () => {
  it('returns [] when no faq messages', () => {
    expect(getFaqItems(undefined)).toEqual([]);
    expect(getFaqItems({ sections: {} } as any)).toEqual([]);
  });

  it('skips entries missing question or answer', () => {
    const t = {
      sections: {
        faq: {
          refund: { question: 'Q', answer: 'A' },
          password: { question: 'Q only' },
        },
      },
    } as any;
    const items = getFaqItems(t);
    expect(items.map((i) => i.key)).toEqual(['refund']);
  });
});
```

### `ContactAvatars.test.tsx`

```tsx
import { render } from '@testing-library/react';
import { ContactAvatars } from './ContactAvatars';

// minimal Tamagui provider mock — match what other web tests use
jest.mock('tamagui', () => ({
  useTheme: () => ({ background: { val: '#151718' } }),
}));

describe('ContactAvatars', () => {
  it('renders the requested number of avatars', () => {
    const { container } = render(<ContactAvatars count={4} />);
    expect(container.querySelectorAll('span > span').length).toBe(4);
  });

  it('marks the stack aria-hidden', () => {
    const { container } = render(<ContactAvatars count={2} />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });
});
```

### `ContactSidePanel.test.tsx`

```tsx
import { render, screen } from '@testing-library/react';
import { ContactSidePanel } from './ContactSidePanel';

describe('ContactSidePanel', () => {
  it('renders working hours from props', () => {
    render(<ContactSidePanel side={undefined} workingHours="Mon–Fri 10–18" />);
    expect(screen.getByText('Mon–Fri 10–18')).toBeInTheDocument();
  });

  it('exposes the GitHub issue link', () => {
    render(<ContactSidePanel side={undefined} workingHours="—" />);
    const link = screen.getByRole('link', { name: /Open an issue/i });
    expect(link).toHaveAttribute('href', 'https://github.com/arcadeum');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders press email as a mailto:', () => {
    render(
      <ContactSidePanel
        side={{ pressEmail: 'press@arc.games' } as any}
        workingHours="—"
      />,
    );
    const link = screen.getByRole('link', { name: 'press@arc.games' });
    expect(link).toHaveAttribute('href', 'mailto:press@arc.games');
  });
});
```

Update `legal/types.ts` to include the new keys (`stats.*Value`, `channels.discord.memberCount`, `side.onCallTeam`, `side.onCallRegion`, `side.coverageValue`, `side.medianFirstReplyValue`).

---

## Suggested commit sequence

```
fix(web): resolve theme tokens via useTheme on /contact (ARC-575)
fix(web): swap hard-coded contact strings for i18n (ARC-575)
fix(web): tighten contact form responsive nits (ARC-575)
test(web): add unit tests for ContactFaq, ContactSidePanel, ContactAvatars (ARC-575)
docs(handoffs): document contact API constraints (ARC-575)
```

Each is small enough to review independently. Run `pnpm lint && pnpm test && pnpm check-file-length` after the lot — none of these should push files past the 500-line cap.
