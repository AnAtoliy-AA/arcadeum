# Solana Token Ecosystem Implementation Plan (Phases 1-4)

> [!NOTE]
> This document may not reflect the current implementation.
> See the final report for up-to-date state:
> [Final Report](../reports/solana-token-ecosystem.md)

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Solana blockchain into Arcadeum to enable ARCADEUM token tracking, buy-back, and on-chain withdrawal with a 2% fee.

**Architecture:** Add `arcadeum` as a third currency to the existing wallet system (alongside `coins` and `gems`). Create a new `solana` module in the backend for on-chain operations (wallet management, SPL token transfers). Extend the Terms of Service with crypto utility disclaimers. Build a "Withdraw to Wallet" page on web that connects Phantom and triggers on-chain transfers.

**Tech Stack:** `@solana/web3.js`, `@solana/spl-token`, `@solana/wallet-adapter-react` (web), NestJS, MongoDB/Mongoose, Next.js

---

## File Structure

### Backend (`apps/be`)

| File                                    | Action | Purpose                                                |
| --------------------------------------- | ------ | ------------------------------------------------------ |
| `src/solana/solana.module.ts`           | Create | NestJS module for Solana operations                    |
| `src/solana/solana.service.ts`          | Create | Core Solana logic: keypair loading, SPL token transfer |
| `src/solana/solana.controller.ts`       | Create | POST /solana/withdraw endpoint                         |
| `src/solana/dto/withdraw.dto.ts`        | Create | Withdrawal request DTO                                 |
| `src/solana/lib/solana-keypair.ts`      | Create | Load platform wallet keypair from env                  |
| `src/solana/lib/arcadeum-token.ts`      | Create | SPL token mint address + decimals constant             |
| `src/wallet/interfaces/wallet-types.ts` | Modify | Add `arcadeum` currency + new wallet reasons           |
| `src/wallet/wallet.service.ts`          | Modify | Support `arcadeum` currency in balance                 |
| `src/app.module.ts`                     | Modify | Register SolanaModule                                  |
| `src/auth/schemas/user.schema.ts`       | Modify | Add `arcadeum` field to User                           |

### Web (`apps/web`)

| File                                              | Action | Purpose                               |
| ------------------------------------------------- | ------ | ------------------------------------- |
| `src/features/wallet/server/wallet.types.ts`      | Modify | Add `arcadeum` to WalletCurrency type |
| `src/features/wallet/ui/WalletBalanceSummary.tsx` | Modify | Show ARCADEUM balance                 |
| `src/features/withdraw/`                          | Create | Withdraw feature directory            |
| `src/features/withdraw/ui/WithdrawToWallet.tsx`   | Create | Phantom connect + withdraw button     |
| `src/features/withdraw/lib/usePhantom.ts`         | Create | Phantom wallet connection hook        |
| `src/app/[locale]/wallet/page.tsx`                | Modify | Add withdraw section                  |

### i18n

| File                                   | Action | Purpose                      |
| -------------------------------------- | ------ | ---------------------------- |
| `src/shared/i18n/messages/legal/en.ts` | Modify | Add crypto disclaimer to ToS |
| `src/shared/i18n/messages/wallet.ts`   | Create | Wallet + withdraw i18n keys  |

---

## Task 1: Add ARCADEUM Currency to Wallet System

**Covers:** Phase 1 (virtual points for ARCADEUM), Phase 2 (token tracking)

**Files:**

- Modify: `apps/be/src/wallet/interfaces/wallet-types.ts`
- Modify: `apps/be/src/auth/schemas/user.schema.ts`
- Modify: `apps/be/src/wallet/wallet.service.ts`
- Modify: `apps/web/src/features/wallet/server/wallet.types.ts`

- [ ] **Step 1: Add `arcadeum` to wallet currencies and reasons**

In `apps/be/src/wallet/interfaces/wallet-types.ts`:

```typescript
export const WALLET_CURRENCIES = ['coins', 'gems', 'arcadeum'] as const;
export type WalletCurrency = (typeof WALLET_CURRENCIES)[number];

export const WALLET_REASONS = [
  'admin_grant',
  'admin_deduct',
  'game_win',
  'tournament_entry',
  'tournament_refund',
  'tournament_prize',
  'gem_purchase',
  'gem_to_coin_conversion_debit',
  'gem_to_coin_conversion_credit',
  'referral_bonus',
  'referral_tier_bonus',
  'daily_reward',
  'shop_purchase',
  'shop_sell_refund',
  'battle_pass_reward',
  'achievement',
  'daily_challenge',
  'token_purchase',
  'token_withdrawal',
  'token_withdrawal_fee',
  'tournament_token_prize',
  'wager_entry',
  'wager_prize',
  'wager_fee',
] as const;
export type WalletReason = (typeof WALLET_REASONS)[number];
```

- [ ] **Step 2: Add `arcadeum` field to User schema**

In `apps/be/src/auth/schemas/user.schema.ts`, add after the `gems` field (line 51):

```typescript
  @Prop({ type: Number, default: 0, min: 0 })
  arcadeum!: number;
```

- [ ] **Step 3: Update WalletService to support `arcadeum` currency**

In `apps/be/src/wallet/wallet.service.ts`:

1. Update `UserBalanceFields` type (line 27):

```typescript
type UserBalanceFields = { coins: number; gems: number; arcadeum: number };
```

2. Update `getBalance` method (lines 112-120):

```typescript
async getBalance(userId: string): Promise<WalletBalance> {
  const user = await this.userModel.findById(userId).lean();
  if (!user) throw new NotFoundException('wallet.userNotFound');
  const balances = user as unknown as UserBalanceFields;
  return {
    coins: balances.coins ?? 0,
    gems: balances.gems ?? 0,
    arcadeum: balances.arcadeum ?? 0,
  };
}
```

3. Update `assertCurrency` method (lines 290-294):

```typescript
private assertCurrency(currency: string): void {
  if (currency !== 'coins' && currency !== 'gems' && currency !== 'arcadeum') {
    throw new InvalidCurrencyException(currency);
  }
}
```

4. Update `WalletBalance` interface import in `apps/be/src/wallet/interfaces/wallet-balance.interface.ts`:

```typescript
export interface WalletBalance {
  coins: number;
  gems: number;
  arcadeum: number;
}
```

- [ ] **Step 4: Update web wallet types**

In `apps/web/src/features/wallet/server/wallet.types.ts`:

```typescript
export type WalletCurrency = 'coins' | 'gems' | 'arcadeum';
export type WalletReason =
  | 'admin_grant'
  | 'admin_deduct'
  | 'game_win'
  | 'tournament_entry'
  | 'tournament_refund'
  | 'tournament_prize'
  | 'gem_purchase'
  | 'gem_to_coin_conversion_debit'
  | 'gem_to_coin_conversion_credit'
  | 'referral_bonus'
  | 'referral_tier_bonus'
  | 'daily_reward'
  | 'shop_purchase'
  | 'shop_sell_refund'
  | 'battle_pass_reward'
  | 'achievement'
  | 'daily_challenge'
  | 'token_purchase'
  | 'token_withdrawal'
  | 'token_withdrawal_fee'
  | 'tournament_token_prize'
  | 'wager_entry'
  | 'wager_prize'
  | 'wager_fee';

export interface WalletBalance {
  coins: number;
  gems: number;
  arcadeum: number;
}
```

- [ ] **Step 5: Update WalletBalanceSummary to show ARCADEUM**

In `apps/web/src/features/wallet/ui/WalletBalanceSummary.tsx`, add after the gems card (after line 96):

```tsx
<div
  data-testid="balance-arcadeum"
  style={{
    flex: '1 1 160px',
    padding: '20px 24px',
    borderRadius: '12px',
    background: 'rgba(52,211,153,0.08)',
    border: '1px solid rgba(52,211,153,0.2)',
  }}
>
  <div style={{ fontSize: '12px', color: '#a1a1aa', marginBottom: '6px' }}>
    🎮 ARCADEUM
  </div>
  <div
    style={{ fontSize: '28px', fontWeight: 700, color: '#34d399' }}
    data-testid="balance-arcadeum-value"
  >
    <AnimatedNumber value={arcadeum} locale={locale} />
  </div>
</div>
```

Also update the Props interface and destructuring to include `arcadeum`.

- [ ] **Step 6: Run tests**

Run: `cd apps/be && pnpm test`
Expected: All existing tests pass (new currency is backward-compatible)

- [ ] **Step 7: Commit**

```bash
git add apps/be/src/wallet/interfaces/wallet-types.ts apps/be/src/auth/schemas/user.schema.ts apps/be/src/wallet/wallet.service.ts apps/be/src/wallet/interfaces/wallet-balance.interface.ts apps/web/src/features/wallet/server/wallet.types.ts apps/web/src/features/wallet/ui/WalletBalanceSummary.tsx
git commit -m "feat(wallet): add arcadeum currency to wallet system"
```

---

## Task 2: Create Solana Module (Backend)

**Covers:** Phase 2 (Solana integration), Phase 3 (buy-back), Phase 4 (withdrawal)

**Files:**

- Create: `apps/be/src/solana/solana.module.ts`
- Create: `apps/be/src/solana/solana.service.ts`
- Create: `apps/be/src/solana/solana.controller.ts`
- Create: `apps/be/src/solana/dto/withdraw.dto.ts`
- Create: `apps/be/src/solana/lib/solana-keypair.ts`
- Create: `apps/be/src/solana/lib/arcadeum-token.ts`
- Modify: `apps/be/src/app.module.ts`

- [ ] **Step 1: Install Solana dependencies**

Run: `cd apps/be && pnpm add @solana/web3.js @solana/spl-token`
Run: `cd apps/be && pnpm add -D @types/node`

- [ ] **Step 2: Create arcadeum token constants**

Create `apps/be/src/solana/lib/arcadeum-token.ts`:

```typescript
import { PublicKey } from '@solana/web3.js';

/**
 * ARCADEUM SPL Token configuration.
 * Replace MINT_ADDRESS with your actual token mint after launching on Pump.fun.
 */
export const ARCADEUM_MINT_ADDRESS = new PublicKey(
  process.env.ARCADEUM_MINT_ADDRESS ?? '11111111111111111111111111111111',
);

export const ARCADEUM_DECIMALS = 9;

/**
 * Convert human-readable ARCADEUM amount to raw token units.
 */
export function toRawAmount(humanAmount: number): bigint {
  return BigInt(Math.round(humanAmount * 10 ** ARCADEUM_DECIMALS));
}

/**
 * Convert raw token units to human-readable ARCADEUM amount.
 */
export function fromRawAmount(rawAmount: bigint): number {
  return Number(rawAmount) / 10 ** ARCADEUM_DECIMALS;
}
```

- [ ] **Step 3: Create Solana keypair loader**

Create `apps/be/src/solana/lib/solana-keypair.ts`:

```typescript
import { Keypair } from '@solana/web3.js';

let cachedKeypair: Keypair | null = null;

/**
 * Load the platform wallet keypair from SOLANA_PRIVATE_KEY env var.
 * The env var should contain a JSON array of 64 numbers (the secret key).
 */
export function getPlatformKeypair(): Keypair {
  if (cachedKeypair) return cachedKeypair;

  const raw = process.env.SOLANA_PRIVATE_KEY;
  if (!raw) {
    throw new Error(
      'SOLANA_PRIVATE_KEY environment variable is not set. ' +
        'Generate a keypair and set it as a JSON array of 64 numbers.',
    );
  }

  try {
    const secretKey = Uint8Array.from(JSON.parse(raw));
    cachedKeypair = Keypair.fromSecretKey(secretKey);
    return cachedKeypair;
  } catch {
    throw new Error(
      'SOLANA_PRIVATE_KEY is invalid. Expected a JSON array of 64 numbers.',
    );
  }
}
```

- [ ] **Step 4: Create Solana service**

Create `apps/be/src/solana/solana.service.ts`:

```typescript
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  getAccount,
} from '@solana/spl-token';
import { ConfigService } from '@nestjs/config';
import { getPlatformKeypair } from './lib/solana-keypair';
import {
  ARCADEUM_MINT_ADDRESS,
  ARCADEUM_DECIMALS,
  toRawAmount,
  fromRawAmount,
} from './lib/arcadeum-token';

@Injectable()
export class SolanaService {
  private readonly logger = new Logger(SolanaService.name);
  private readonly connection: Connection;

  constructor(private readonly config: ConfigService) {
    const rpcUrl =
      this.config.get<string>('SOLANA_RPC_URL') ??
      'https://api.mainnet-beta.solana.com';
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  async getPlatformBalance(): Promise<{ sol: number; arcadeum: number }> {
    const keypair = getPlatformKeypair();
    const solBalance = await this.connection.getBalance(keypair.publicKey);

    let arcadeumBalance = 0;
    try {
      const ata = await getAssociatedTokenAddress(
        ARCADEUM_MINT_ADDRESS,
        keypair.publicKey,
      );
      const account = await getAccount(this.connection, ata);
      arcadeumBalance = fromRawAmount(account.amount);
    } catch {
      this.logger.warn('Platform wallet has no ARCADEUM token account');
    }

    return {
      sol: solBalance / LAMPORTS_PER_SOL,
      arcadeum: arcadeumBalance,
    };
  }

  async transferArcadeum(
    recipientAddress: string,
    amount: number,
  ): Promise<string> {
    const keypair = getPlatformKeypair();
    const recipient = new PublicKey(recipientAddress);
    const rawAmount = toRawAmount(amount);

    const fromAta = await getAssociatedTokenAddress(
      ARCADEUM_MINT_ADDRESS,
      keypair.publicKey,
    );
    const toAta = await getAssociatedTokenAddress(
      ARCADEUM_MINT_ADDRESS,
      recipient,
    );

    const transaction = new Transaction().add(
      createTransferInstruction(fromAta, toAta, keypair.publicKey, rawAmount),
    );

    const { blockhash, lastValidBlockHeight } =
      await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.feePayer = keypair.publicKey;
    transaction.sign(keypair);

    const signature = await this.connection.sendRawTransaction(
      transaction.serialize(),
    );

    await this.connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    });

    this.logger.log(
      `Transferred ${amount} ARCADEUM to ${recipientAddress}: ${signature}`,
    );
    return signature;
  }

  async transferSol(
    recipientAddress: string,
    lamports: number,
  ): Promise<string> {
    const keypair = getPlatformKeypair();
    const recipient = new PublicKey(recipientAddress);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: recipient,
        lamports,
      }),
    );

    const { blockhash, lastValidBlockHeight } =
      await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.feePayer = keypair.publicKey;
    transaction.sign(keypair);

    const signature = await this.connection.sendRawTransaction(
      transaction.serialize(),
    );

    await this.connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    });

    this.logger.log(
      `Transferred ${lamports} lamports to ${recipientAddress}: ${signature}`,
    );
    return signature;
  }
}
```

- [ ] **Step 5: Create withdraw DTO**

Create `apps/be/src/solana/dto/withdraw.dto.ts`:

```typescript
import { IsNotEmpty, IsString, IsNumber, Min, Max } from 'class-validator';

export class WithdrawDto {
  @IsNotEmpty()
  @IsString()
  walletAddress!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(1_000_000)
  amount!: number;
}
```

- [ ] **Step 6: Create Solana controller**

Create `apps/be/src/solana/solana.controller.ts`:

```typescript
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { SolanaService } from './solana.service';
import { WalletService } from '../wallet/wallet.service';
import { WithdrawDto } from './dto/withdraw.dto';
import { randomUUID } from 'crypto';
import type { AuthenticatedUser } from '../auth/jwt/jwt.strategy';

const WITHDRAWAL_FEE_PERCENT = 2;

@Controller('solana')
export class SolanaController {
  constructor(
    private readonly solana: SolanaService,
    private readonly wallet: WalletService,
  ) {}

  @Get('platform-balance')
  @UseGuards(JwtAuthGuard)
  async platformBalance(@Req() req: { user: AuthenticatedUser }) {
    return this.solana.getPlatformBalance();
  }

  @Post('withdraw')
  @UseGuards(JwtAuthGuard)
  async withdraw(
    @Req() req: { user: AuthenticatedUser },
    @Body() dto: WithdrawDto,
  ) {
    const userId = req.user.userId;
    const feeAmount = Math.ceil((dto.amount * WITHDRAWAL_FEE_PERCENT) / 100);
    const totalDeduction = dto.amount + feeAmount;

    const balance = await this.wallet.getBalance(userId);
    if (balance.arcadeum < totalDeduction) {
      throw new Error('Insufficient ARCADEUM balance');
    }

    await this.wallet.debit(
      userId,
      'arcadeum',
      dto.amount,
      'token_withdrawal',
      randomUUID(),
      {
        walletAddress: dto.walletAddress,
        amount: dto.amount,
        fee: feeAmount,
      },
    );

    if (feeAmount > 0) {
      await this.wallet.debit(
        userId,
        'arcadeum',
        feeAmount,
        'token_withdrawal_fee',
        randomUUID(),
        {
          walletAddress: dto.walletAddress,
          withdrawalAmount: dto.amount,
        },
      );
    }

    const signature = await this.solana.transferArcadeum(
      dto.walletAddress,
      dto.amount,
    );

    return {
      success: true,
      signature,
      amount: dto.amount,
      fee: feeAmount,
      totalDeducted: totalDeduction,
    };
  }
}
```

- [ ] **Step 7: Create Solana module**

Create `apps/be/src/solana/solana.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SolanaService } from './solana.service';
import { SolanaController } from './solana.controller';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [ConfigModule, WalletModule],
  controllers: [SolanaController],
  providers: [SolanaService],
  exports: [SolanaService],
})
export class SolanaModule {}
```

- [ ] **Step 8: Register SolanaModule in AppModule**

In `apps/be/src/app.module.ts`, add import and register:

```typescript
import { SolanaModule } from './solana/solana.module';
```

Add to imports array (after `SupportModule`):

```typescript
SolanaModule,
```

- [ ] **Step 9: Run tests**

Run: `cd apps/be && pnpm test`
Expected: All tests pass

- [ ] **Step 10: Commit**

```bash
git add apps/be/src/solana/ apps/be/src/app.module.ts
git commit -m "feat(solana): add Solana module with SPL token transfer and withdrawal"
```

---

## Task 3: Update Terms of Service with Crypto Disclaimer

**Covers:** Phase 1 (ToS crypto disclaimer)

**Files:**

- Modify: `apps/web/src/shared/i18n/messages/legal/en.ts` (and other locales)
- Modify: `apps/web/src/shared/i18n/messages/legal/types.ts`

- [ ] **Step 1: Add crypto section to legal types**

In `apps/web/src/shared/i18n/messages/legal/types.ts`, add to `TermsMessages` interface:

```typescript
  crypto?: {
    title: string;
    content: string;
  };
```

- [ ] **Step 2: Add crypto section to English ToS**

In `apps/web/src/shared/i18n/messages/legal/en.ts`, add inside the terms object:

```typescript
  crypto: {
    title: 'Cryptocurrency & Digital Assets',
    content: 'ARCADEUM tokens and virtual points are utility assets meant exclusively for entertainment within our skill-based gaming platform. They have no inherent monetary value outside the platform. Users are solely responsible for their local cryptocurrency tax compliance and regulatory obligations. Arcadeum does not guarantee the value of any digital assets and users should not treat them as investments.',
  },
```

- [ ] **Step 3: Add crypto section to other locales**

Add equivalent translations to `ru.ts`, `es.ts`, `fr.ts`, `by.ts`.

- [ ] **Step 4: Add crypto section to TermsContent component**

In `apps/web/src/app/[locale]/terms/TermsContent.tsx`, add after the `liability` section (before `governingLaw`):

```tsx
{
  s?.crypto && (
    <Section variant="legal" title={s?.crypto?.title}>
      <Typography variant="body" uiSize="md" alpha="high">
        {s?.crypto?.content}
      </Typography>
    </Section>
  );
}
```

- [ ] **Step 5: Run tests**

Run: `cd apps/web && pnpm test`
Expected: Tests pass

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/shared/i18n/messages/legal/ apps/web/src/app/[locale]/terms/TermsContent.tsx
git commit -m "feat(legal): add cryptocurrency disclaimer to Terms of Service"
```

---

## Task 4: Build Withdraw to Wallet Page (Web)

**Covers:** Phase 4 (Withdraw to Wallet UI)

**Files:**

- Create: `apps/web/src/features/withdraw/ui/WithdrawToWallet.tsx`
- Create: `apps/web/src/features/withdraw/lib/usePhantom.ts`
- Create: `apps/web/src/features/withdraw/server/withdraw.server.ts`
- Modify: `apps/web/src/app/[locale]/wallet/page.tsx`

- [ ] **Step 1: Create Phantom wallet hook**

Create `apps/web/src/features/withdraw/lib/usePhantom.ts`:

```typescript
'use client';

import { useState, useCallback } from 'react';

interface PhantomProvider {
  isPhantom?: boolean;
  connect: () => Promise<{ publicKey: { toString(): string } }>;
  disconnect: () => Promise<void>;
  publicKey: { toString(): string } | null;
  isConnected: boolean;
}

declare global {
  interface Window {
    solana?: PhantomProvider;
  }
}

export function usePhantom() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    if (!window.solana?.isPhantom) {
      setError('Phantom wallet not found. Please install it.');
      return;
    }
    setIsConnecting(true);
    setError(null);
    try {
      const resp = await window.solana.connect();
      setPublicKey(resp.publicKey.toString());
      setIsConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    await window.solana?.disconnect();
    setPublicKey(null);
    setIsConnected(false);
  }, []);

  return { publicKey, isConnected, isConnecting, error, connect, disconnect };
}
```

- [ ] **Step 2: Create withdraw server action**

Create `apps/web/src/features/withdraw/server/withdraw.server.ts`:

```typescript
import 'server-only';
import { cookies } from 'next/headers';
import { resolveApiUrl } from '@/shared/lib/api-base';

export class WithdrawError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WithdrawError';
  }
}

export async function submitWithdrawal(params: {
  walletAddress: string;
  amount: number;
}): Promise<{
  success: boolean;
  signature: string;
  amount: number;
  fee: number;
  totalDeducted: number;
}> {
  const cookieJar = await cookies();
  const token = cookieJar.get('web_access_token')?.value;
  if (!token) throw new WithdrawError('Not authenticated');

  const res = await fetch(resolveApiUrl('/solana/withdraw'), {
    method: 'POST',
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new WithdrawError(`Withdrawal failed: ${res.status} ${body}`);
  }

  return res.json();
}
```

- [ ] **Step 3: Create WithdrawToWallet component**

Create `apps/web/src/features/withdraw/ui/WithdrawToWallet.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { usePhantom } from '../lib/usePhantom';
import { submitWithdrawal } from '../server/withdraw.server';

const WITHDRAWAL_FEE_PERCENT = 2;

interface Props {
  arcadeumBalance: number;
}

export function WithdrawToWallet({ arcadeumBalance }: Props) {
  const {
    publicKey,
    isConnected,
    isConnecting,
    error: phantomError,
    connect,
    disconnect,
  } = usePhantom();
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    signature: string;
    amount: number;
    fee: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const numericAmount = Number(amount) || 0;
  const fee = Math.ceil((numericAmount * WITHDRAWAL_FEE_PERCENT) / 100);
  const totalDeduction = numericAmount + fee;
  const canSubmit =
    isConnected && numericAmount > 0 && totalDeduction <= arcadeumBalance;

  const handleSubmit = async () => {
    if (!publicKey || !canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const res = await submitWithdrawal({
        walletAddress: publicKey,
        amount: numericAmount,
      });
      setResult(res);
      setAmount('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Withdrawal failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px' }}>
      <h2
        style={{
          fontSize: '20px',
          fontWeight: 700,
          marginBottom: '8px',
          color: '#e4e4e7',
        }}
      >
        Withdraw to Wallet
      </h2>
      <p style={{ fontSize: '14px', color: '#71717a', marginBottom: '24px' }}>
        Transfer your ARCADEUM tokens to your Phantom wallet. A 2% fee applies.
      </p>

      {!isConnected ? (
        <button
          onClick={connect}
          disabled={isConnecting}
          style={{
            width: '100%',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            background: '#ab9ff2',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 600,
            cursor: isConnecting ? 'wait' : 'pointer',
          }}
        >
          {isConnecting ? 'Connecting...' : 'Connect Phantom Wallet'}
        </button>
      ) : (
        <>
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: 'rgba(52,211,153,0.1)',
              border: '1px solid rgba(52,211,153,0.3)',
              marginBottom: '16px',
              fontSize: '13px',
              color: '#34d399',
              wordBreak: 'break-all',
            }}
          >
            Connected: {publicKey}
            <button
              onClick={disconnect}
              style={{
                marginLeft: '12px',
                background: 'none',
                border: 'none',
                color: '#71717a',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Disconnect
            </button>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                color: '#a1a1aa',
                marginBottom: '6px',
              }}
            >
              Amount (Available: {arcadeumBalance.toLocaleString()} ARCADEUM)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={1}
              max={arcadeumBalance}
              placeholder="Enter amount"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                color: '#e4e4e7',
                fontSize: '16px',
                outline: 'none',
              }}
            />
          </div>

          {numericAmount > 0 && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.03)',
                marginBottom: '16px',
                fontSize: '13px',
                color: '#a1a1aa',
              }}
            >
              <div>Amount: {numericAmount.toLocaleString()} ARCADEUM</div>
              <div>Fee (2%): {fee.toLocaleString()} ARCADEUM</div>
              <div style={{ color: '#e4e4e7', fontWeight: 600 }}>
                You receive: {numericAmount.toLocaleString()} ARCADEUM
              </div>
            </div>
          )}

          {(error || phantomError) && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                marginBottom: '16px',
                color: '#ef4444',
                fontSize: '13px',
              }}
            >
              {error || phantomError}
            </div>
          )}

          {result && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.3)',
                marginBottom: '16px',
                color: '#22c55e',
                fontSize: '13px',
              }}
            >
              Withdrawal successful! TX: {result.signature.slice(0, 16)}...
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            style={{
              width: '100%',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: canSubmit ? '#34d399' : 'rgba(255,255,255,0.1)',
              color: canSubmit ? '#fff' : '#71717a',
              fontSize: '16px',
              fontWeight: 600,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
            }}
          >
            {isSubmitting ? 'Processing...' : 'Withdraw'}
          </button>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Add withdraw section to wallet page**

In `apps/web/src/app/[locale]/wallet/page.tsx`, add import and render:

```typescript
import { WithdrawToWallet } from '@/features/withdraw/ui/WithdrawToWallet';
```

After the `ConvertGemsForm` section, add:

```tsx
<div style={GEM_SECTIONS_STYLE} data-testid="withdraw-section">
  <WithdrawToWallet arcadeumBalance={balance.arcadeum ?? 0} />
</div>
```

- [ ] **Step 5: Run tests**

Run: `cd apps/web && pnpm test`
Expected: Tests pass

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/features/withdraw/ apps/web/src/app/[locale]/wallet/page.tsx
git commit -m "feat(wallet): add Withdraw to Wallet page with Phantom integration"
```

---

## Task 5: Token Buy-Back Admin Endpoint

**Covers:** Phase 3 (buy-back mechanism)

**Files:**

- Create: `apps/be/src/solana/dto/buyback.dto.ts`
- Modify: `apps/be/src/solana/solana.controller.ts`

- [ ] **Step 1: Create buyback DTO**

Create `apps/be/src/solana/dto/buyback.dto.ts`:

```typescript
import { IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

export class BuybackDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0.001)
  @Max(1000)
  solAmount!: number;
}
```

- [ ] **Step 2: Add buyback endpoint to controller**

In `apps/be/src/solana/solana.controller.ts`, add import and endpoint:

```typescript
import { BuybackDto } from './dto/buyback.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
```

Add new endpoint:

```typescript
  @Post('buyback')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async buyback(
    @Req() req: { user: AuthenticatedUser },
    @Body() dto: BuybackDto,
  ) {
    // Buy ARCADEUM tokens from open market using SOL
    // This is a placeholder - actual implementation depends on
    // whether tokens are on Raydium/Jupiter DEX
    this.logger.log(
      `Buyback initiated: ${dto.solAmount} SOL by admin ${req.user.userId}`,
    );
    return {
      success: true,
      message: 'Buyback endpoint ready. Implement DEX integration.',
      solAmount: dto.solAmount,
    };
  }
```

- [ ] **Step 3: Run tests**

Run: `cd apps/be && pnpm test`
Expected: Tests pass

- [ ] **Step 4: Commit**

```bash
git add apps/be/src/solana/dto/buyback.dto.ts apps/be/src/solana/solana.controller.ts
git commit -m "feat(solana): add admin buy-back endpoint for token purchases"
```

---

## Task 6: Environment Configuration

**Covers:** Phase 2 (Solana config)

**Files:**

- Modify: `apps/be/.env.example` (if exists, or document)

- [ ] **Step 1: Document required env vars**

Create or update `apps/be/.env.example` with:

```bash
# Solana Configuration
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_PRIVATE_KEY=[64,secret,key,numbers,here]
ARCADEUM_MINT_ADDRESS=your_token_mint_address_here
```

- [ ] **Step 2: Commit**

```bash
git add apps/be/.env.example
git commit -m "docs: add Solana environment variable documentation"
```

---

## Summary

| Task | Phase | Description                       | Est. Time |
| ---- | ----- | --------------------------------- | --------- |
| 1    | 1-2   | Add ARCADEUM currency to wallet   | 30 min    |
| 2    | 2-4   | Create Solana module (backend)    | 2 hours   |
| 3    | 1     | Update ToS with crypto disclaimer | 30 min    |
| 4    | 4     | Build Withdraw to Wallet page     | 1.5 hours |
| 5    | 3     | Token buy-back admin endpoint     | 30 min    |
| 6    | 2     | Environment configuration         | 10 min    |

**Total estimated time:** ~5 hours

**Prerequisites before running:**

1. `pnpm install` in repo root (after adding Solana deps)
2. Generate Solana keypair: `solana-keygen new --outfile keypair.json`
3. Set `SOLANA_PRIVATE_KEY` env var with the keypair JSON array
4. Launch token on Pump.fun and set `ARCADEUM_MINT_ADDRESS`
5. Fund platform wallet with SOL for gas fees
