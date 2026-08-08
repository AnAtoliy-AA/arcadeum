# Arcadeum — Growth & Popularity Improvement Plan

Context: Arcadeum ([arcadeum.games](https://arcadeum.games)) is a free, no-signup, browser-based multiplayer party/board game platform (Sea Battle, Tic-Tac-Toe, Cascade, Critical, Glimworm coming soon) with real-time rooms, chat, spectator mode, stats, and tournaments "coming soon." Repo: [github.com/AnAtoliy-AA/arcadeum](https://github.com/AnAtoliy-AA/arcadeum).

This doc lists concrete, prioritized ideas to grow awareness, acquisition, and retention.

---

## 1. Viral / Invite Loop (highest leverage — it's free distribution)

- [ ] One-tap "Copy invite link" with a pre-filled share sheet for WhatsApp / Telegram / iMessage / Discord.
- [ ] Generate a QR code per room for in-person groups (party settings, classrooms, etc.).
- [ ] Auto-generate per-game OG preview images (title, art, player count) so shared links look great when pasted into chats.
- [ ] Referral incentive: unlock a new game variant/theme/skin after a friend joins via your invite and completes a match.
- [ ] "Rematch" / "Play again with same group" button that regenerates a room and re-shares the link in one click.

## 2. SEO & Organic Discovery

- [ ] Give every game its own indexable landing page (rules, player count, match length, FAQ) with a strong H1 like "Play Battleship Online Free with Friends."
- [ ] Add `schema.org` `VideoGame` / `Game` structured data to each game page.
- [ ] Target long-tail keywords with real intent, low competition:
  - "battleship online multiplayer no download"
  - "play uno online free browser"
  - "tic tac toe with friends link"
  - "free jackbox alternative online"
- [ ] Ensure Next.js pages are fully SSR/crawlable (verify with Google Search Console coverage report).
- [ ] Backlink outreach: get listed on "best free online multiplayer games" roundup articles and game-review blogs.
- [ ] Position explicitly against paid competitors in copy/SEO: "free Jackbox alternative," "free Skribbl.io alternative."

## 3. Distribution Channels

- [ ] Reddit: post/engage in r/WebGames, r/InternetIsBeautiful, r/boardgames, r/tabletopsimulator.
- [ ] Product Hunt launch (polished, "instant play, no signup" angle performs well there).
- [ ] Short-form video (TikTok/Shorts/Reels): funny/chaotic clips from Glimworm, Sea Battle, Cascade — party games clip well.
- [ ] Discord: build a `/play` bot command that drops a room link directly into a server — friend groups already coordinate there.
- [ ] Pitch to Twitch/YouTube "game night" streamers as a free browser-based party game.

## 4. Retention Hooks

- [ ] Ship Tournaments + Achievements (already teased as "Coming Soon") — ranked/competitive play drives return visits.
- [ ] Turn notifications: push/email "it's your turn" or "your friend started a game" — turn-based games die from silent abandonment.
- [ ] PWA install prompt (you already support "Install as Web App") — home-screen installs return more than bookmarks.
- [ ] Win-rate / history / streak stats surfaced prominently after each match (you already track stats — make them visible and shareable).

## 5. Product Positioning

- [ ] Explicitly market as a free, no-download, no-signup alternative to Jackbox Games / Skribbl.io in landing copy, App Store copy (when mobile ships), and ad creatives.
- [ ] Lead messaging with "instant play" and "no account needed" — this is a real differentiator vs. most competitors that gate behind signup.

## 6. Analytics & Instrumentation

- [ ] Instrument the funnel: landing → room created → friend joined → match completed.
- [ ] Track invite-link click-through and conversion rate specifically — this is your main growth lever, so measure it directly.
- [ ] A/B test share copy/CTA wording ("Invite friends" vs "Challenge a friend" vs "Share room link").

---

## Suggested First Sprint (2 weeks)

1. Invite link sharing polish (share sheet + OG images) — #1
2. SEO landing pages for top 3 games + schema markup — #2
3. Reddit + Product Hunt launch — #3
4. Basic funnel analytics — #6

These four are low-effort, high-signal, and will tell you quickly which channel/lever is working before investing further (e.g., in tournaments or paid ads).
