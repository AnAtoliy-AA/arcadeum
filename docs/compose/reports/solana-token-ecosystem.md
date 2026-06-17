---
feature: solana-token-ecosystem
status: delivered
specs: []
plans:
  - docs/compose/plans/2026-06-17-solana-token-ecosystem.md
branch: develop
commits: 78dac198..2f22f9e1
---

# Solana Token Ecosystem — Final Report

## What Was Built

Integrated Solana blockchain into Arcadeum's existing wallet infrastructure to enable ARCADEUM token tracking, on-chain withdrawal with Phantom wallet, and admin buy-back capabilities. The system adds `arcadeum` as a third currency alongside `coins` and `gems`, creating a bridge between the platform's virtual economy and Solana SPL tokens.

Players can now see their ARCADEUM balance in the wallet, connect a Phantom wallet, and withdraw tokens on-chain with a 2% fee. Admins can execute token buy-backs from the open market. The Terms of Service now include a cryptocurrency utility disclaimer across all 5 supported locales.

## Architecture

### Backend (NestJS)

**New module:** `apps/be/src/solana/`

- `solana.service.ts` — Core Solana operations: connection management, SPL token transfers, SOL transfers, platform balance queries
- `solana.controller.ts` — REST endpoints: `POST /solana/withdraw` (authenticated), `GET /solana/platform-balance` (authenticated), `POST /solana/buyback` (admin-only)
- `lib/solana-keypair.ts` — Loads platform wallet keypair from `SOLANA_PRIVATE_KEY` env var
- `lib/arcadeum-token.ts` — SPL token mint address, decimals, and raw/human amount conversion utilities

**Modified:**

- `wallet/interfaces/wallet-types.ts` — Added `arcadeum` to `WALLET_CURRENCIES`, added withdrawal/wager reasons to `WALLET_REASONS`
- `auth/schemas/user.schema.ts` — Added `arcadeum` field (Number, default 0)
- `wallet/wallet.service.ts` — Extended `UserBalanceFields`, `getBalance()`, `assertCurrency()` for arcadeum
- `wallet/interfaces/wallet-balance.interface.ts` — Added `arcadeum` to `WalletBalance`
- `app.module.ts` — Registered `SolanaModule`

### Web (Next.js)

**New feature:** `apps/web/src/features/withdraw/`

- `lib/usePhantom.ts` — Client hook for Phantom wallet connection/disconnection
- `server/withdraw.server.ts` — Server Action that calls `POST /solana/withdraw`
- `ui/WithdrawToWallet.tsx` — Full withdrawal UI: Phantom connect, amount input, fee preview, submit, result display

**Modified:**

- `features/wallet/server/wallet.types.ts` — Added `arcadeum` to `WalletCurrency` and new wallet reasons
- `features/wallet/ui/WalletBalanceSummary.tsx` — Added ARCADEUM balance card (green theme)
- `app/[locale]/wallet/page.tsx` — Added withdraw section below gem store

### i18n

**Modified:** `shared/i18n/messages/legal/` — Added `crypto` section to `TermsMessages` type and all 5 locale files (en, ru, es, fr, by). `TermsContent.tsx` renders the new section conditionally.

### Data Flow

```
User → Phantom Connect → WithdrawToWallet → Server Action → POST /solana/withdraw
  → SolanaController → WalletService.debit (arcadeum) → SolanaService.transferArcadeum
  → @solana/web3.js SPL transfer → Solana blockchain
```

### Design Decisions

- **Extended existing wallet system** rather than creating a separate token module — the `coins`/`gems`/`arcadeum` triple-currency model keeps all balance logic centralized and transaction-history consistent.
- **Server Actions** for withdrawal (not REST fetch from client) — keeps the Solana RPC URL and private key server-side only, prevents key exposure to browser.
- **2% fee calculated server-side** — fee is deducted as a separate `token_withdrawal_fee` transaction for audit trail clarity.
- **`@solana/web3.js` directly** (not a wallet adapter library for backend) — the platform wallet is a server-side keypair, not a browser extension.

## Usage

### Environment Variables

```bash
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_PRIVATE_KEY=[64,secret,key,numbers,here]
ARCADEUM_MINT_ADDRESS=your_token_mint_address_here
```

### API Endpoints

| Endpoint                   | Method | Auth        | Description                            |
| -------------------------- | ------ | ----------- | -------------------------------------- |
| `/solana/platform-balance` | GET    | JWT         | Platform wallet SOL + ARCADEUM balance |
| `/solana/withdraw`         | POST   | JWT         | Withdraw ARCADEUM to connected wallet  |
| `/solana/buyback`          | POST   | JWT + Admin | Buy ARCADEUM from open market          |

### Withdrawal Flow

1. User navigates to `/wallet`
2. Scrolls to "Withdraw to Wallet" section
3. Clicks "Connect Phantom Wallet" → Phantom popup
4. Enters withdrawal amount → sees 2% fee preview
5. Clicks "Withdraw" → server debits balance, transfers tokens on-chain
6. Sees transaction signature confirmation

## Verification

- All 120 backend test suites (1074 tests) pass
- All 152 web test suites (1102 tests) pass
- Pre-commit hooks (ESLint, TypeScript, tests) pass on all 6 commits
- New currency is backward-compatible — existing wallet tests unaffected

## Journey Log

- [lesson] `import 'server-only'` in a file imported by `'use client'` components breaks — switched to `'use server'` directive for Next.js Server Actions
- [lesson] ESLint `no-unsafe-argument` flags `JSON.parse()` output — explicit `as number[]` cast needed for Solana keypair loading
- [lesson] `RolesGuard` must be explicitly provided in each NestJS module that uses it — not globally available even with `@UseGuards`

## Source Materials

| File                                                      | Role                | Notes                  |
| --------------------------------------------------------- | ------------------- | ---------------------- |
| `docs/compose/plans/2026-06-17-solana-token-ecosystem.md` | Implementation plan | 6 tasks, all completed |
