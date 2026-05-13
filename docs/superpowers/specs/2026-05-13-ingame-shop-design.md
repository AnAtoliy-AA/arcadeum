# ARC-650 — In-Game Shop (Cosmetics v1)

**Status:** approved design, ready for implementation planning
**Ticket:** ARC-650
**Date:** 2026-05-13
**Depends on:** ARC-615 (wallet foundation), ARC-616 (wallet earn/spend), ARC-617 (gem top-up), ARC-619 (economy settings admin) — all merged on `develop`.

## Summary

Introduce a top-level **`/shop`** where players spend the existing in-app currencies (`coins`, `gems`) on **cosmetic items**. v1 ships the **architecture** for four categories (`avatar`, `badge`, `name_color`, `game_skin`) and **seeds content** for the first two (`avatar`, `badge`). Players can browse the catalog, buy with coins or gems, equip one item per slot, sell back items for partial refund, and view their inventory. Admins can toggle item availability, override prices, and grant items to specific users.

This unlocks gem demand beyond the existing convert-to-coins path and adds a permanent coin sink alongside tournament entry. It is the first product surface that lets a paying player visibly customize their identity across the app.

## Goals

1. Give players something meaningful to spend coins and gems on, beyond tournament entry.
2. Surface a recognisable identity layer (avatar + badge) that renders in chat, leaderboards, lobby, and profile.
3. Keep the catalog content-side (seed file + admin overrides) so pricing/availability tuning never requires a deploy.
4. Make purchase and sell-back idempotent under retries, the same way wallet writes already are.
5. Land the schema and APIs for the two non-shipped categories (`name_color`, `game_skin`) so adding items to them later is content-only.

## Non-goals

- No real-money purchases inside the shop itself — gem top-up remains the only fiat surface (handled in `/wallet`).
- No name-color or game-skin **content** in v1 (schema-ready, zero items).
- No time-limited / seasonal items (admin `available` toggle is enough to retire items).
- No bundles, no gifting between players, no item trading.
- No achievement-locked items (purely store-purchasable in v1).
- No item-stat / gameplay-affecting items (cosmetics only — Glimworm powerups remain orthogonal).
- No mobile admin surface (matches the wallet/economy/tournaments pattern).
- No public catalog endpoint with auth-gated pricing variants (one effective price per item, same for all).

## Key decisions

### D1 — Static seed catalog + Mongo override

**Decision:** The full catalog is a typed `Record<ShopItemId, ShopItemDef>` in `apps/be/src/shop/lib/shop-catalog.ts` (new). Each entry is the source of truth for id, category, rarity, asset URL, i18n keys, and default price. An admin-tunable `ShopItemOverride` Mongo doc per-item can override `available`, `priceAmount`, `priceCurrency` (read-through TTL cache, 60s, mirrors `EconomySettings`).

**Why split:** Adding an item is a code change (it ships an asset, an i18n key, and a price the team has discussed). Tuning availability or price is an ops change that must not require a deploy. Two layers cleanly split content from operations and mirror the existing `EconomySettings` pattern operators are already trained on.

### D2 — Four categories, two surfaced

**Decision:** `ShopCategory = 'avatar' | 'badge' | 'name_color' | 'game_skin'`. The catalog supports all four; v1 seeds only `avatar` and `badge`. The shop UI renders all four categories in the sidebar; categories with zero available items render an empty state instead of being hidden, so a follow-up content-only ticket can land items by editing the seed file and locales.

**Why ship the full enum now:** The category enum is referenced by inventory rows, equip slots, admin filters, and i18n keys. Adding a category later means schema migration + UI rework. Adding _items_ to an existing category is just an append. Pay the schema cost once.

### D3 — Four rarity tiers, soft price convention

**Decision:** `ShopRarity = 'common' | 'rare' | 'epic' | 'legendary'`. Convention (NOT enforced in code): Common priced in coins; Rare/Epic/Legendary priced in gems. The `defaultPriceCurrency` field on each item is the truth — admins can override price _and_ currency per item if needed.

**Why soft convention:** A hard rule ("rarity ⇒ currency") removes pricing flexibility (e.g. a "starter rare" item priced in coins for a sale event). A convention with admin override is enough discipline for content planning without locking the team out of legitimate exceptions.

### D4 — Own many, equip one per slot

**Decision:** Players accumulate a permanent inventory of every item they've ever bought (`UserInventoryItem` Mongo collection). Each category has a single equip slot on the `User` document — v1 adds `equippedAvatarId` and `equippedBadgeId`. Equipping is free, instant, and idempotent. Players can unequip (slot ⇒ `null`).

**Why a permanent inventory:** A "purchase replaces previous" model punishes players for spending and kills cosmetic-shop revenue. Standard pattern (LoL, Fortnite, every store) is buy-once, equip-many. Equip state lives on `User` because every render site already loads the user document.

### D5 — Buy = atomic wallet debit + inventory insert + auto-equip

**Decision:** A purchase request flows through `ShopService.purchase(userId, itemId, purchaseId)` and runs inside a single Mongo transaction that:

1. Resolves the effective item (catalog + override + availability check).
2. Calls `WalletService.debit(...)` with the existing `parentSession` extension.
3. Inserts a `UserInventoryItem` row (`purchaseId`, `acquiredVia: priceCurrency`, `paidAmount`, `paidCurrency`).
4. Sets the matching equip slot on `User` (`equippedAvatarId` or `equippedBadgeId`).

A failure on any step rolls back all four. Auto-equip means the player immediately sees their new look (no "why didn't it change?" confusion).

**Why auto-equip:** A cosmetic the player can't see is a worse purchase confirmation than the modal itself. They can always swap back from their inventory tab.

### D6 — Sell-back = partial refund in coins, audit-preserved

**Decision:** `ShopService.sellBack(userId, purchaseId)` runs inside one transaction:

1. Loads the inventory row, asserts owner + not already sold + not a starter item + not currently equipped.
2. Calculates refund: 50% of `paidAmount` (rounded down), in `coins`. **For gem-priced items, the refund is `floor(paidAmount * gem_to_coin_rate * 0.5)` coins** — paid via the existing gem-to-coin rate so there is no gem-laundering loop.
3. Calls `WalletService.credit(...)` with `reason: 'shop_sell_refund'`.
4. Marks the inventory row `soldAt: new Date()` (soft-delete; preserved for audit).

If the sold item was equipped (it must be unequipped first per the precondition), no slot mutation happens. Re-buying a sold item creates a brand-new inventory row with a new `purchaseId` — sell-back does not "undo" a purchase, it just exchanges it.

**Why 50% coins (not gems):** A gem-in / gem-out loop with any positive refund gives gem-holders a free recycle on any cosmetic they regret. Paying refunds in coins, at half the post-conversion value, makes sell-back a coin-economy reset valve, not a gem speculation tool.

**Why require unequip first:** Two-step ("unequip ⇒ sell") is one more click than "sell which also unequips," but it forces a moment of pause on a destructive-feeling action and removes the edge case where the player has no fallback avatar/badge after a sell.

### D7 — Starter items: one free avatar + one free badge for new users

**Decision:** Two items in the seed file are flagged `starter: true` with `defaultPriceAmount: 0` — `avatar-default-01` and `badge-newcomer`. A `ShopInventoryBootstrap` (OnApplicationBootstrap) idempotently inserts both rows for any user whose inventory doesn't contain them, and sets `equippedAvatarId`/`equippedBadgeId` if currently null. Future new users get them inline via `AuthService` on registration.

**Why a backfill + inline grant:** Existing users on develop don't yet have inventory rows; the bootstrap closes that gap once. New users from this point forward get items at registration time so they never see a blank avatar even on first session.

### D8 — Purchase idempotency via client-supplied `purchaseId`

**Decision:** The buy endpoint takes a client-generated `purchaseId` (UUID v4). Wallet idempotency key is `shop-buy-${purchaseId}`. The inventory row's unique index is on `{ userId, purchaseId }`. A retried request with the same `purchaseId` is a no-op (returns the prior row); two distinct buy clicks (two UUIDs) buy two copies of the same item — which is allowed and useful because **re-buying after a sell-back is a legitimate flow**.

**Why client-generated, not server-side `${userId}-${itemId}-${nonce}`:** A nonce derived from "current sell-back count" would be a race condition under concurrent clicks. The client owns the click; let it own the dedup token.

### D9 — Admin grant is a separate, no-charge code path

**Decision:** `POST /admin/shop/grant` takes `{ userId, itemId, reason }`. Inserts an inventory row with `acquiredVia: 'grant'`, `paidAmount: null`. Does not touch wallet. Does not auto-equip. Idempotency key: `shop-grant-${userId}-${itemId}-${nonce}` (admin-supplied or UUID); a second grant of the same item to the same user is allowed (admins may want to grant extras).

**Why not auto-equip:** A grant is an admin action; the user should choose when/if to equip it. Different from a self-purchase where the player implicitly chose.

### D10 — Equip / unequip is a pure User-document update

**Decision:** `ShopService.equip(userId, itemId)` verifies the user owns a non-sold inventory row for `itemId`, resolves the item's category, and sets `equipped{Category}Id = itemId`. Unequip sets it to `null`. Both are simple `$set` updates outside a transaction — no wallet, no inventory mutation.

### D11 — Wallet-write failures are surfaced to the client

**Decision:** A failed `wallet.debit` on purchase, or `wallet.credit` on sell-back, aborts the whole transaction and returns the wallet's HTTP code (422 for insufficient funds, 400 for invalid currency, 500 for transient). The shop never returns "you bought it but we couldn't charge you."

**Why different from game-win:** Game wins are a passive credit on session completion — failing them silently and reconciling later is fine because the player isn't waiting on the result. Purchases are explicit player actions; the player is staring at the modal and needs a clear yes/no.

## Data model

### `ShopItemDef` (TypeScript, not persisted)

```ts
// apps/be/src/shop/lib/shop-types.ts
export const SHOP_CATEGORIES = [
  'avatar',
  'badge',
  'name_color',
  'game_skin',
] as const;
export type ShopCategory = (typeof SHOP_CATEGORIES)[number];

export const SHOP_RARITIES = ['common', 'rare', 'epic', 'legendary'] as const;
export type ShopRarity = (typeof SHOP_RARITIES)[number];

export const SHOP_PRICE_CURRENCIES = ['coins', 'gems'] as const;
export type ShopPriceCurrency = (typeof SHOP_PRICE_CURRENCIES)[number];

export interface ShopItemDef {
  id: string;
  category: ShopCategory;
  rarity: ShopRarity;
  nameKey: string; // i18n key under pages.shop.items
  descKey: string;
  assetUrl: string; // relative or absolute; client renders <img src>
  defaultPriceAmount: number;
  defaultPriceCurrency: ShopPriceCurrency;
  starter?: boolean; // bootstrap-granted, cannot be sold, price 0
}
```

### `ShopItemOverride` (Mongo, sparse)

```ts
// apps/be/src/shop/schemas/shop-item-override.schema.ts
@Schema({ timestamps: true, collection: 'shop_item_overrides' })
class ShopItemOverride {
  @Prop({ required: true, unique: true, index: true }) itemId!: string;
  @Prop({ type: Boolean, default: null }) available?: boolean | null;
  @Prop({ type: Number, default: null, min: 0, max: 1_000_000 }) priceAmount?:
    | number
    | null;
  @Prop({ type: String, default: null, enum: [...SHOP_PRICE_CURRENCIES, null] })
  priceCurrency?: ShopPriceCurrency | null;
  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  updatedBy?: Types.ObjectId | null;
}
```

`null` on an override field means "use catalog default." This avoids storing redundant rows and matches how `EconomySetting` overrides are sparse.

### `UserInventoryItem` (Mongo)

```ts
// apps/be/src/shop/schemas/user-inventory-item.schema.ts
@Schema({ timestamps: true, collection: 'user_inventory_items' })
class UserInventoryItem {
  @Prop({ required: true, index: true }) userId!: string;
  @Prop({ required: true, index: true }) itemId!: string;
  @Prop({ required: true }) purchaseId!: string;
  @Prop({
    type: String,
    enum: ['coins', 'gems', 'grant', 'starter'],
    required: true,
  })
  acquiredVia!: 'coins' | 'gems' | 'grant' | 'starter';
  @Prop({ type: Number, default: null }) paidAmount?: number | null;
  @Prop({ type: String, default: null })
  paidCurrency?: ShopPriceCurrency | null;
  @Prop({ type: Date, default: null }) soldAt?: Date | null;
}
// Indexes:
//   { userId: 1, purchaseId: 1 }   — unique, dedup buys
//   { userId: 1, itemId: 1, soldAt: 1 }  — fast "owns this?" lookup
```

### `User` schema additions

[apps/be/src/auth/schemas/user.schema.ts](apps/be/src/auth/schemas/user.schema.ts):

```ts
@Prop({ type: String, default: null }) equippedAvatarId?: string | null;
@Prop({ type: String, default: null }) equippedBadgeId?: string | null;
```

A one-time `User.updateMany({ equippedAvatarId: { $exists: false } }, ...)` bootstrap sets both to `null` for existing users — they'll be populated by `ShopInventoryBootstrap` (granting starter items) immediately after.

### `WALLET_REASONS` additions

[apps/be/src/wallet/interfaces/wallet-types.ts](apps/be/src/wallet/interfaces/wallet-types.ts):

```ts
'shop_purchase',
'shop_sell_refund',
```

Idempotency keys:

- Buy: `shop-buy-${purchaseId}` (client UUID)
- Sell: `shop-sell-${purchaseId}` (the inventory row's `purchaseId`)
- Grant: `shop-grant-${userId}-${itemId}-${nonce}` (admin-supplied or auto-UUID)

## Seed content (v1)

`apps/be/src/shop/lib/shop-catalog.ts` (new):

```ts
export const SHOP_CATALOG: Record<string, ShopItemDef> = {
  // ── Avatars ──
  'avatar-default-01': { /* starter */ category: 'avatar', rarity: 'common',
    defaultPriceAmount: 0, defaultPriceCurrency: 'coins', starter: true,
    assetUrl: '/shop/avatars/default-01.png', nameKey: 'avatar.default01.name', descKey: '...' },
  'avatar-fox-01':     { category: 'avatar', rarity: 'common',  defaultPriceAmount: 200,  defaultPriceCurrency: 'coins', ... },
  'avatar-cat-01':     { category: 'avatar', rarity: 'common',  defaultPriceAmount: 200,  defaultPriceCurrency: 'coins', ... },
  'avatar-dragon-01':  { category: 'avatar', rarity: 'rare',    defaultPriceAmount: 3,    defaultPriceCurrency: 'gems', ... },
  'avatar-phoenix-01': { category: 'avatar', rarity: 'epic',    defaultPriceAmount: 10,   defaultPriceCurrency: 'gems', ... },
  'avatar-cosmic-01':  { category: 'avatar', rarity: 'legendary', defaultPriceAmount: 30, defaultPriceCurrency: 'gems', ... },

  // ── Badges ──
  'badge-newcomer':    { /* starter */ category: 'badge', rarity: 'common',
    defaultPriceAmount: 0, defaultPriceCurrency: 'coins', starter: true, ... },
  'badge-veteran':     { category: 'badge', rarity: 'common',  defaultPriceAmount: 500,  defaultPriceCurrency: 'coins', ... },
  'badge-champion':    { category: 'badge', rarity: 'rare',    defaultPriceAmount: 5,    defaultPriceCurrency: 'gems', ... },
  'badge-legend':      { category: 'badge', rarity: 'legendary', defaultPriceAmount: 50, defaultPriceCurrency: 'gems', ... },
};
```

Final asset paths, exact pricing, and the complete badge set (target: ~8 avatars, ~6 badges) are agreed at implementation time. Placeholder PNGs (initial silhouettes for avatars; SVG glyphs for badges) live under `apps/web/public/shop/` (new directory) and are served as static assets by Next.js. Mobile reads the same URLs via its existing image host config.

## Backend

### Module wiring

```
ShopModule
  imports:
    - forwardRef(() => AuthModule)            // user model, guards
    - WalletModule                            // WalletService for debit/credit
    - JwtModule.registerAsync(...)            // matches WalletModule pattern, for any future gateway
    - MongooseModule.forFeature([User, ShopItemOverride, UserInventoryItem])
  controllers: [ShopController, AdminShopController]
  providers:   [CatalogService, InventoryService, ShopService, ShopInventoryBootstrap, RolesGuard]
  exports:     [InventoryService]             // AuthService consumes for new-user starter grant

AuthModule.imports += [forwardRef(() => ShopModule)]   // grant starters on registration
```

`WalletService` is already exported by `WalletModule` (ARC-615) and already accepts `parentSession` (ARC-616).

### Services

**`CatalogService`** — pure read service.

- `listEffective(filter?)` → `EffectiveShopItem[]` (catalog × overrides × availability filter). Cache: keyed by override-doc version (`updatedAt` max), 60s TTL — same pattern as `EconomySettingsService`.
- `getEffective(itemId)` → `EffectiveShopItem | null`.
- `setOverride(itemId, patch, adminUserId)` → upserts; bumps cache version.

**`InventoryService`** — per-user owned items.

- `listForUser(userId, opts?)` → `UserInventoryItem[]` (excludes `soldAt != null` by default; admin debug includes them).
- `owns(userId, itemId)` → `boolean`.
- `grantStarter(userId, session?)` — inserts both starter rows + sets equip slots if null. Idempotent via the unique `{userId, purchaseId}` index where `purchaseId = 'starter-${userId}-${itemId}'`.
- `equip(userId, itemId)` / `unequip(userId, category)`.

**`ShopService`** — orchestration.

- `purchase(userId, itemId, purchaseId)` — full transactional buy (D5).
- `sellBack(userId, purchaseId)` — full transactional sell (D6).
- `grant(userId, itemId, adminUserId, reason)` — no-wallet admin grant (D9).

**`ShopInventoryBootstrap`** (`OnApplicationBootstrap`) — backfill starters for existing users (D7). One-shot, idempotent, logs count.

### REST API

| Method  | Route                           | Auth  | Body / Query                                   | Returns                                                                              |
| ------- | ------------------------------- | ----- | ---------------------------------------------- | ------------------------------------------------------------------------------------ |
| `GET`   | `/shop/catalog`                 | none  | `?category=avatar&rarity=epic`                 | `EffectiveShopItem[]`                                                                |
| `GET`   | `/shop/inventory`               | jwt   | none                                           | `{ items: UserInventoryItem[], equipped: { avatar, badge, name_color, game_skin } }` |
| `POST`  | `/shop/purchase`                | jwt   | `{ itemId, purchaseId }`                       | `{ inventoryItem, equipped, balance }`                                               |
| `POST`  | `/shop/sell`                    | jwt   | `{ purchaseId }`                               | `{ refundAmount, refundCurrency, balance }`                                          |
| `POST`  | `/shop/equip`                   | jwt   | `{ itemId }`                                   | `{ equipped }`                                                                       |
| `POST`  | `/shop/unequip`                 | jwt   | `{ category }`                                 | `{ equipped }`                                                                       |
| `GET`   | `/admin/shop/overrides`         | admin | none                                           | `ShopItemOverride[]`                                                                 |
| `PATCH` | `/admin/shop/overrides/:itemId` | admin | `{ available?, priceAmount?, priceCurrency? }` | `ShopItemOverride`                                                                   |
| `POST`  | `/admin/shop/grant`             | admin | `{ userId, itemId, reason }`                   | `UserInventoryItem`                                                                  |

All public endpoints `@UseGuards(JwtAuthGuard)`. Admin endpoints `@UseGuards(JwtAuthGuard, RolesGuard) @Roles('admin')`. DTOs `class-validator`'d.

### Error semantics

| Condition                                             | Exception                                        | HTTP |
| ----------------------------------------------------- | ------------------------------------------------ | ---- |
| `itemId` not in catalog                               | `NotFoundException('shop.unknownItem')`          | 404  |
| Item not available (override or never)                | `BadRequestException('shop.unavailable')`        | 400  |
| Insufficient balance                                  | `InsufficientFundsException` (existing)          | 422  |
| Sell of starter item                                  | `BadRequestException('shop.starterNotSellable')` | 400  |
| Sell of already-sold inventory row                    | `BadRequestException('shop.alreadySold')`        | 400  |
| Sell of equipped item                                 | `BadRequestException('shop.unequipFirst')`       | 400  |
| Equip of unowned item                                 | `BadRequestException('shop.notOwned')`           | 400  |
| Equip of item from a different category than the slot | `BadRequestException('shop.categoryMismatch')`   | 400  |

### Public catalog endpoint behavior

`/shop/catalog` is public (no auth required) and excludes overrides where `available === false`. The same payload shape powers both web (SSR + client) and mobile.

## Web UI

### Routing & layout

- New top-level page `apps/web/src/app/shop/page.tsx` (new) — Server Component, fetches catalog server-side, hydrates a client island for filters and purchase/sell mutations.
- Header gains a "Shop" link between "Games" and "Wallet". Mobile drawer + bottom-nav equivalents update.
- Layout: persistent left sidebar (categories + rarity checkboxes), right-side responsive grid of item cards. On `<md` viewports, sidebar collapses to a top filter bar (segmented control for categories, popover for rarity).

### Feature folder

`apps/web/src/features/shop/` (new):

```
features/shop/
  server/
    shop.server.ts          // getCatalog, getInventory  (Next-side fetchers)
    shop.types.ts
  hooks/
    useCatalog.ts           // TanStack Query — public, ISR-friendly
    useInventory.ts         // TanStack Query — authed
    usePurchase.ts          // useMutation; generates purchaseId; calls /shop/purchase
    useSellBack.ts
    useEquip.ts / useUnequip.ts
  ui/
    ShopPageView.tsx        // sidebar + grid layout
    ShopSidebar.tsx
    ShopGrid.tsx
    ShopItemCard.tsx
    PurchaseConfirmDialog.tsx
    SellConfirmDialog.tsx
    InventoryTab.tsx        // owned items, equip toggles
  store/
    shopFiltersStore.ts     // Zustand: selected category + rarity[]
  index.ts
```

### New `@arcadeum/ui` components

Catalog with `/check-ui-components` first. The catalog currently has no avatar primitive or rarity-bordered card. Add:

- **`Avatar`** — circular image with fallback (initials of `displayName`). Sizes: `sm | md | lg | xl`. Used everywhere a user image is currently rendered (chat sender, lobby roster, profile, header). Props: `src?: string | null; name: string; size?: AvatarSize`.
- **`BadgeChip`** — small inline badge: icon + optional label. Sizes `sm | md`. Rendered next to display name in chat, leaderboards, lobby, profile header.
- **`RarityBorder`** — wraps any child with a rarity-tinted border + soft glow. Colours come from existing Tamagui tokens; tier mapping: common = `$gray7`, rare = `$blue8`, epic = `$purple8`, legendary = `$yellow8`.
- **`ShopItemCard`** — composite using `RarityBorder` + asset preview + price chip + owned/equipped indicator.

The `Avatar` and `BadgeChip` primitives ship with v1 and are wired into the existing render sites (chat, leaderboards, lobby, profile) so equip changes are immediately visible. Inventory display today renders only `displayName`; this is the moment that changes.

### Purchase confirm flow

Mirrors the existing tournament-register confirm dialog (`apps/web/src/features/admin-tournaments/`). Modal shows: large item preview, name, description, rarity badge, **effective** price + currency, current balance for that currency, "Confirm" button (disabled if insufficient). On confirm: `usePurchase` generates a UUID `purchaseId` (stable for the lifetime of the dialog so React-double-render is idempotent), calls `/shop/purchase`. On success: optimistic balance update via the wallet socket gateway's existing balance push (no manual invalidation needed), inventory refetch, dialog closes, brief toast "Equipped." On 422: inline error + link to `/wallet`.

### Sell confirm flow

Modal shows item preview + "Refund: N coins" (computed client-side from the item's `paidAmount` and the current gem-to-coin rate fetched once on page load). Button copy is "Sell for N coins." Confirm calls `/shop/sell` with the inventory row's `purchaseId`. Success: balance updates via socket push, inventory refetch, toast.

If the item is currently equipped, the sell button is disabled with a tooltip "Unequip first" — keeps the precondition visible to the user.

### Inventory tab

A tab inside `/shop` (alongside "Browse") showing owned items, grouped by category. Each owned item card has an "Equipped" badge if active, an "Equip" button if not (single click; no confirm — equip is trivially reversible), and a "Sell" link.

### Profile integration

The existing profile page renders `displayName`. Add the equipped `Avatar` (above the name) and `BadgeChip` (inline next to the name). A "Customize" button next to the avatar deep-links to `/shop`.

### Header link

`apps/web/src/widgets/Header/` — add "Shop" item between Games and Wallet. Mobile drawer + any bottom-nav variants follow.

## Mobile UI

`apps/mobile/app/shop/` (new):

```
shop/
  _layout.tsx
  index.tsx                 // catalog grid
  inventory.tsx             // owned items
```

- Top segmented control: Browse | Inventory.
- Browse: horizontal-scroll category chip row, vertical 2-column grid of cards.
- Tap card → bottom sheet with `Avatar`/`BadgeChip` preview + price + Buy/Cancel.
- Inventory: grouped by category; long-press card → action sheet (Equip / Unequip / Sell).

Mobile `Avatar` and `BadgeChip` components live in the existing mobile `components/` path (Tamagui-shared with `@arcadeum/ui` where possible). Existing chat / lobby / profile render sites consume them.

Add a "Shop" entry in the mobile tab bar.

## Admin UI

`apps/web/src/app/admin/shop/page.tsx` (new) and `apps/web/src/features/admin-shop/` (new):

- Mirrors `/admin/economy` layout — table of every catalog item (rendered from the catalog + override join).
- Per-row: id, category, rarity, name (i18n), default price, effective price (with badge if overridden), available toggle, "Edit" button (opens dialog with `priceAmount` + `priceCurrency` inputs and a "Reset" action).
- Sidebar gets a "Shop" entry below "Economy".
- "Grant item" action button on the page → dialog: user picker (search by username/email, reuses the admin-users autocomplete) + item picker (search the catalog) + reason text. Posts to `/admin/shop/grant`.
- Edit + grant actions write through server actions; audit log entries are written by the BE controller (mirrors `EconomySettings` audit, but we'll co-locate audit on the override doc as `updatedBy/updatedAt` since the override is small — no separate audit collection in v1).

## i18n

Web (5 locales: en, ru, es, fr, by) — add `pages.shop` namespace under `apps/web/src/shared/i18n/messages/pages/shop/<locale>.ts`. Mobile (3 locales: en, es, fr) — equivalent path.

Required keys (sketch):

```ts
{
  meta: { title, description },
  title, subtitle,
  tabs: { browse, inventory },
  filters: { category, rarity, all, available, owned },
  rarity: { common, rare, epic, legendary },
  category: { avatar, badge, name_color, game_skin },
  card: { owned, equipped, buy, sell, equip, unequip, sold, free, comingSoon },
  confirm: {
    purchaseTitle, purchaseBody,
    sellTitle, sellBody,
    yourBalance, refundAmount,
    confirmBuy, confirmSell, cancel,
  },
  errors: {
    insufficientFunds, unavailable, alreadySold, starterNotSellable,
    unequipFirst, notOwned, categoryMismatch, transient,
  },
  empty: { categoryEmpty, inventoryEmpty },
  items: {
    avatar: {
      default01: { name, desc },
      fox01:     { name, desc },
      cat01:     { name, desc },
      dragon01:  { name, desc },
      phoenix01: { name, desc },
      cosmic01:  { name, desc },
    },
    badge: {
      newcomer:  { name, desc },
      veteran:   { name, desc },
      champion:  { name, desc },
      legend:    { name, desc },
    },
  },
  profile: { customize },
  admin: {                                                 // web admin namespace
    title, subtitle,
    columns: { id, category, rarity, name, defaultPrice, effectivePrice, available, actions },
    actions: { edit, reset, grant },
    grantDialog: { title, user, item, reason, grant },
  },
}
```

`WalletReason` labels for `shop_purchase` and `shop_sell_refund` are added to the existing `pages.wallet.reasons` namespace in all 5 web + 3 mobile locales.

## Validation, errors, security

- All DTOs validated with `class-validator` (UUIDs validated as v4; itemId validated against a length cap to bound storage; reason text capped at 280 chars).
- All wallet writes go through `WalletService.credit/debit` — never direct `User.coins/gems` mutation (the existing ESLint guardrail from ARC-615 covers this).
- Admin endpoints triple-guarded: `JwtAuthGuard + RolesGuard + @Roles('admin')`.
- Public `/shop/catalog` is unauthenticated by design (bot-crawlable for SEO/featured content), but never exposes overrides for `available === false` items.
- Sell-back validates ownership _and_ that the row's `userId` matches the JWT subject — preventing forged-`purchaseId` attacks.
- Catalog asset URLs are static or admin-controlled; no user-supplied URLs are ever rendered.
- File-size rule (`pnpm check-file-length` < 500 lines) respected by splitting `ShopService` into per-action helper modules if needed.

## Tests

### Unit (Jest)

**`catalog.service.spec.ts`** — catalog × override join; cache hit/miss; unavailable item filtered out; admin override applied.

**`inventory.service.spec.ts`** — `grantStarter` idempotent; `owns` ignores sold rows; `equip` rejects unowned / category-mismatch; `equip` rejects sold rows.

**`shop.service.spec.ts`** —

- `purchase`: happy path debits, inserts row, equips. Insufficient funds rolls back wallet AND inventory. Duplicate `purchaseId` returns prior row. Unknown item → 404. Unavailable item → 400.
- `sellBack`: happy path credits coins, marks `soldAt`. Coin item refunds in coins; gem item refunds in coins via gem→coin rate (verify math with mocked rate). Starter row rejected. Already-sold rejected. Equipped rejected.
- `grant`: inserts row, no wallet call, no equip. Duplicate-detection via supplied nonce.

**`wallet-reasons.spec.ts`** — `shop_purchase` and `shop_sell_refund` are valid `WalletReason` values.

### Integration (Mongo replica set — existing infra from ARC-615)

**`shop.service.integration-spec.ts`** —

- End-to-end purchase: wallet ledger row + inventory row + equip slot, all visible after commit; balance reduced.
- Concurrent purchase of the same item with two distinct `purchaseId`s succeeds twice; with the same `purchaseId` (retry) succeeds once.
- Purchase failure midway (force wallet error): no inventory row, no equip change, no wallet row.
- Sell-back: ledger + soft-delete + balance restored partially. Gem-item refund value matches `floor(paid * rate * 0.5)` with rate read from `EconomySettings`.
- Bootstrap idempotency: running `ShopInventoryBootstrap.onApplicationBootstrap` twice grants starters exactly once.

### Web Vitest

- `usePurchase` generates a stable `purchaseId` per dialog open; re-fires don't change it.
- `ShopItemCard` renders rarity border and price chip; "Owned" badge appears when `inventory.owns(itemId)`.
- `PurchaseConfirmDialog` disables Confirm when balance < price; renders insufficient-funds inline error on 422.
- `SellConfirmDialog` disables when item equipped; shows correct refund preview for both coin and gem items.
- i18n key presence test for `pages.shop` (existing pattern in the repo).

### Mobile Jest

- Purchase bottom sheet renders price + balance and routes to the wallet on 422.
- Inventory long-press surfaces Equip / Unequip / Sell actions appropriately based on equipped state.

### Playwright (e2e scaffolds, `test.skip` matching existing pattern)

- Browse catalog → buy coin item → balance reduces, item appears in inventory, equipped.
- Buy gem item → balance reduces in gems → sell-back returns coins → inventory marks item sold.
- Admin overrides price → public catalog reflects new price.
- Admin grants item to a user → user's inventory shows it as `acquiredVia: grant`.

## Cross-cutting compliance

- File size: every new/modified file stays under 500 lines (`pnpm check-file-length`).
- TypeScript: no `any`. Strict typing on all DTOs and views.
- Next.js: Server Component for the `/shop` and `/admin/shop` pages; client islands only for interactions.
- i18n: zero hardcoded user-facing strings; 5 web + 3 mobile locales.
- BE: all DTOs validated; all admin routes guarded with `JwtAuthGuard + RolesGuard + @Roles('admin')`.
- Tests: unit + integration + scaffolded e2e at all relevant layers.
- Wallet writes: only via `WalletService`; ESLint guardrail enforces.
- `@arcadeum/ui`: ran `/check-ui-components` before adding `Avatar`, `BadgeChip`, `RarityBorder`, `ShopItemCard` (catalog confirmed missing primitives).

## Edge cases & open items

| Topic                                             | Decision                                                                                                                                                                                                                                                                                                                                                 | Notes                                                                                           |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| User deletes their account mid-inventory          | Inventory rows remain (audit). Out of scope to GC alongside the user (matches wallet ledger from ARC-615).                                                                                                                                                                                                                                               | Same precedent.                                                                                 |
| Item removed from catalog after some users own it | Existing inventory rows still render; equip continues to work; price-display fallback to the inventory row's `paidAmount` if catalog lookup fails.                                                                                                                                                                                                       | A `getEffectiveOrLegacy(itemId)` helper covers the read.                                        |
| Buying an item the player already owns            | Allowed (creates a second row). Inventory UI groups by `itemId` with a "×N" count.                                                                                                                                                                                                                                                                       | Re-buy after sell is the primary use case; allowing duplicate ownership keeps the model simple. |
| Equipping an item the player doesn't own          | Rejected (400 `shop.notOwned`).                                                                                                                                                                                                                                                                                                                          |                                                                                                 |
| Equipping an item from a different category       | Rejected (400 `shop.categoryMismatch`).                                                                                                                                                                                                                                                                                                                  |                                                                                                 |
| Concurrent admin price overrides                  | Last write wins; override doc is keyed on `itemId`.                                                                                                                                                                                                                                                                                                      | Cache version derived from max `updatedAt` invalidates all consumers within TTL.                |
| Catalog static seed grows large                   | Bound by deliberate content curation; tree-shakeable enum-style.                                                                                                                                                                                                                                                                                         | If catalog exceeds 200 items, revisit moving to a DB collection. Not v1.                        |
| Image hosting / asset pipeline                    | Static assets in `apps/web/public/shop/` for v1.                                                                                                                                                                                                                                                                                                         | A CDN cutover is a follow-up infra ticket.                                                      |
| Localized item names need translator workflow     | Item nameKeys use a flat path so missing translations fall back to the en value.                                                                                                                                                                                                                                                                         | Existing fallback machinery in `useTranslation` handles this.                                   |
| Anti-abuse (rapid buy/sell loop)                  | 50%-in-coins for gem items eliminates the gem-laundering vector; coin items lose 50% per buy/sell cycle, which is itself the deterrent.                                                                                                                                                                                                                  | No explicit cooldown in v1.                                                                     |
| Player has zero of any avatar after a buggy sell  | Backend rejects selling an _equipped_ item, so a player who unequips the starter and sells their only other avatar is left without an equipped avatar. UI handles `equippedAvatarId === null` by falling back to the initials fallback. Starter cannot be sold (D6 precondition), so the player always retains at least one ownable avatar in inventory. | Acceptable.                                                                                     |
