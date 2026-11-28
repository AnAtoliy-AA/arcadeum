# ARC token payments

ARC is the Arcadeum memecoin on Solana (pump.fun mint, 6 decimals). Players can
pay for gem packs and gem-priced shop items with ARC through Solana Pay.

## How it works

1. The web asks `GET /solana/config` for the mint and the pool (single source of
   truth; the web keeps no copy). `NEXT_PUBLIC_ARC_POOL_ADDRESS` still overrides
   the chart pool.
2. `GET /solana/pricing` returns the ARC/USD price with `priceStatus`
   (`ok`, `stale`, `unavailable`, `unconfigured`), `priceSource` and
   `priceAgeSeconds`. Only `ok` is quotable; anything else hides the ARC option
   and makes checkout refuse to quote.
3. `POST /solana/pay/create` creates a Solana Pay session bound to the user, with
   a random reference key. Only the configured mint is accepted.
4. The web polls `GET /solana/pay/status/:sessionId` (`pending`, `confirmed`,
   `failed`, `expired`). `confirmed` is returned only for a real ARC transfer to
   the treasury that carries the session reference. A payment that lands after
   the 10 minute window is still confirmed (`late: true`).
5. The web then calls `POST /payments/gems/orders/arc` or
   `POST /shop/purchase-with-wallet` with the signature. The backend verifies
   the transfer again, binds it to the user (wallet or Solana Pay reference),
   and claims the signature in `arc_redeemed_signatures` (unique), so one
   deposit can never pay twice (same user, other user, gems and shop).

## Price sources

CoinGecko, then pump.fun, then GeckoTerminal (works for tokens still on the
bonding curve). Failures are negative cached (30 s), each source backs off
exponentially (429 backs off longer), the last good price is shown as `stale`
for up to 30 min but checkout refuses prices older than 5 min, and quotes that
swing more than 4x from the previous one or exceed 1000 USD are rejected.

## Configuration (apps/be)

| Variable                        | Purpose                                                                                               |
| ------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `ARCADEUM_MINT_ADDRESS`         | ARC mint. Missing or invalid disables ARC payments and logs an error at startup (no silent fallback). |
| `SOLANA_TREASURY_ADDRESS`       | Must equal the public key of `SOLANA_PRIVATE_KEY`, otherwise verification fails closed.               |
| `SOLANA_RPC_URL`                | Use a paid RPC in staging and prod.                                                                   |
| `SOLANA_RPC_FALLBACK_URLS`      | Comma separated extra RPCs tried after retries with backoff.                                          |
| `ARCADEUM_POOL_ADDRESS`         | Optional pool override for charts.                                                                    |
| `ARC_TX_MAX_AGE_SECONDS`        | Reject deposits older than this (default 1800, 0 disables).                                           |
| `ARC_PAYMENT_TOLERANCE_PERCENT` | Accept payments up to this percent below the quote (default 0, max 10).                               |

## Turning ARC checkout on

ARC checkout is gated by two economy settings (admin economy page). Both
default to off in code paths that check them and are not changed by deploys:

- `gems_allow_arcadeum` = 1 enables gem packs.
- `shop_allow_arcadeum` = 1 enables shop items.
- `arcadeum_discount_percent` is the ARC discount applied to the USD price.

## Ops status

`GET /solana/health` (admin only, read only, no secrets) reports config problems,
RPC health, mint decimals on chain vs code, price source and age, and the flag
values. The backend also logs the ARC config and the active price source on
startup.

## Staging checklist

1. Deploy, then check the backend log for `ARC config:` lines. There must be no
   `ARC config:` errors.
2. Open `/solana/health` as admin. `ok` must be true, `decimals.onChain` must be
   6, `price.status` must be `ok`, and note the `price.source`.
3. Open `/solana/pricing`. `priceStatus` is `ok` and `arcUsdPrice` is above 0.
4. Set `gems_allow_arcadeum` (and optionally `shop_allow_arcadeum`) to 1 for the
   test only.
5. Buy the smallest gem pack with ARC from a test wallet: scan the QR, send the
   exact amount, and watch the status go pending, confirmed, then gems appear.
6. Re-submit the same signature (replay): it must not credit again, and it must
   not unlock a shop item either.
7. Turn the flags back to the intended values.
