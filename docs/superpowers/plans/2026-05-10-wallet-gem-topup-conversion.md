# ARC-617 — Gem Top-up + Gem→Coin Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Players buy gems with real money via PayPal (with idempotent crediting via the PayPal order id) and convert gems to coins atomically at a fixed rate.

**Architecture:** New `GemsModule` extends the existing `payments` PayPal flow. Gem purchase: `createOrder → PayPal redirect → finalizeOrder` (server-side `getOrder` verification, then `WalletService.credit('gems', ..., 'gem_purchase', \`gem-purchase-${paypalOrderId}\`)`— exactly-once via the PayPal order id as the wallet idempotency key). Pending purchases recoverable via a "Verify" UI on`/wallet`. Conversion: `convertGemsToCoins`debits gems and credits coins inside a single Mongo transaction using the`parentSession`pattern from ARC-616. The existing`PaymentsService`PayPal auth + order-create logic is extracted into a shared`PaypalGateway` so both donations and gems share one PayPal client.

**Tech Stack:** NestJS, Mongoose, class-validator, axios (already used for PayPal), Next.js App Router (Server Components + Server Actions for wallet feature, per ARC-615/616 convention), TanStack Query (mobile), `expo-web-browser` (mobile PayPal redirect), Vitest (web), Jest (BE + mobile), Playwright (e2e).

**Spec:** [docs/superpowers/specs/2026-05-10-wallet-gem-topup-conversion-design.md](../specs/2026-05-10-wallet-gem-topup-conversion-design.md)

---

## File structure

### Backend

| Path                                                             | Action | Responsibility                                                                                                |
| ---------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------- |
| `apps/be/src/wallet/interfaces/wallet-types.ts`                  | Modify | Extend `WALLET_REASONS` with `gem_purchase`, `gem_to_coin_conversion_debit`, `gem_to_coin_conversion_credit`. |
| `apps/be/src/wallet/wallet.service.ts`                           | Modify | Expose `MAX_TRANSACTION_AMOUNT` as a public static so the gems module can reuse the cap.                      |
| `apps/be/src/payments/lib/paypal.gateway.ts`                     | Create | Shared PayPal client: `authToken`, `createOrder`, `getOrder`. Extracted from existing `PaymentsService`.      |
| `apps/be/src/payments/payments.service.ts`                       | Modify | Use `PaypalGateway` for auth + order-create. Behaviour-preserving refactor.                                   |
| `apps/be/src/payments/payments.module.ts`                        | Modify | Provide and export `PaypalGateway`.                                                                           |
| `apps/be/src/gems/gems.module.ts`                                | Create | Module wiring (Mongoose features, services, controllers).                                                     |
| `apps/be/src/gems/schemas/gem-package.schema.ts`                 | Create | `GemPackage` Mongoose schema.                                                                                 |
| `apps/be/src/gems/schemas/gem-purchase.schema.ts`                | Create | `GemPurchase` Mongoose schema with unique `paypalOrderId`.                                                    |
| `apps/be/src/gems/interfaces/gem-package.interface.ts`           | Create | `GemPackagePublic`, `GemPackageAdmin` view interfaces.                                                        |
| `apps/be/src/gems/interfaces/gem-purchase.interface.ts`          | Create | `GemPurchaseView`.                                                                                            |
| `apps/be/src/gems/interfaces/conversion.interface.ts`            | Create | Conversion result interface.                                                                                  |
| `apps/be/src/gems/dto/create-gem-package.dto.ts`                 | Create | `CreateGemPackageDto` with class-validator.                                                                   |
| `apps/be/src/gems/dto/update-gem-package.dto.ts`                 | Create | `UpdateGemPackageDto`.                                                                                        |
| `apps/be/src/gems/dto/create-gem-order.dto.ts`                   | Create | `{ packageId: string }`.                                                                                      |
| `apps/be/src/gems/dto/convert-gems.dto.ts`                       | Create | `{ gems: number; conversionId: string }`.                                                                     |
| `apps/be/src/gems/services/gem-packages.service.ts`              | Create | Package CRUD + listing.                                                                                       |
| `apps/be/src/gems/services/gem-purchases.service.ts`             | Create | `createOrder`, `finalizeOrder`, `listPendingForUser`.                                                         |
| `apps/be/src/gems/services/gem-conversion.service.ts`            | Create | `convertGemsToCoins(userId, gems, conversionId)`.                                                             |
| `apps/be/src/gems/controllers/public-gem-packages.controller.ts` | Create | `GET /payments/gems/packages`.                                                                                |
| `apps/be/src/gems/controllers/admin-gem-packages.controller.ts`  | Create | Admin CRUD.                                                                                                   |
| `apps/be/src/gems/controllers/gem-purchases.controller.ts`       | Create | `POST /payments/gems/orders`, finalize, pending list.                                                         |
| `apps/be/src/gems/controllers/gem-conversion.controller.ts`      | Create | `POST /wallet/convert-gems-to-coins`.                                                                         |
| `apps/be/src/gems/lib/gems-bootstrap.ts`                         | Create | Optional seed of default packages on first deploy.                                                            |
| `apps/be/src/gems/services/*.spec.ts`                            | Create | Per-service unit tests.                                                                                       |
| `apps/be/src/gems/controllers/*.spec.ts`                         | Create | Controller integration tests.                                                                                 |
| `apps/be/src/gems/gems.service.integration-spec.ts`              | Create | Real-Mongo end-to-end tests.                                                                                  |
| `apps/be/src/app.module.ts`                                      | Modify | Register `GemsModule`.                                                                                        |
| `apps/be/.env.example`                                           | Modify | Document `GEM_TO_COIN_RATE`.                                                                                  |

### Web

| Path                                                                             | Action | Responsibility                                                            |
| -------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------- |
| `apps/web/src/features/gems/server/gems.types.ts`                                | Create | TS types mirroring BE.                                                    |
| `apps/web/src/features/gems/server/gems.server.ts`                               | Create | Server fetch helpers (`getActivePackages`, `getPendingPurchases`).        |
| `apps/web/src/features/gems/server/gems.actions.ts`                              | Create | `buyGemsAction`, `finalizeGemPurchaseAction`, `convertGemsAction`.        |
| `apps/web/src/features/gems/ui/GemStore.tsx`                                     | Create | Server Component: package list.                                           |
| `apps/web/src/features/gems/ui/GemPackageCard.tsx`                               | Create | Server Component: single card.                                            |
| `apps/web/src/features/gems/ui/BuyGemsButton.tsx`                                | Create | Client component: triggers buy server action.                             |
| `apps/web/src/features/gems/ui/PendingGemPurchases.tsx`                          | Create | Server Component: pending banner.                                         |
| `apps/web/src/features/gems/ui/VerifyGemPurchaseButton.tsx`                      | Create | Client island: verify action.                                             |
| `apps/web/src/features/gems/ui/ConvertGemsForm.tsx`                              | Create | Client form: convert.                                                     |
| `apps/web/src/app/[locale]/wallet/page.tsx`                                      | Modify | Compose `<GemStore />`, `<PendingGemPurchases />`, `<ConvertGemsForm />`. |
| `apps/web/src/features/wallet/server/wallet.types.ts`                            | Modify | Extend `WalletReason`.                                                    |
| `apps/web/src/features/admin-gem-packages/server/admin-gems.actions.ts`          | Create | Admin CRUD server actions.                                                |
| `apps/web/src/features/admin-gem-packages/ui/AdminGemPackagesTable.tsx`          | Create | Admin list.                                                               |
| `apps/web/src/features/admin-gem-packages/ui/AdminGemPackageForm.tsx`            | Create | Admin create/edit form.                                                   |
| `apps/web/src/app/[locale]/admin/gem-packages/page.tsx`                          | Create | Admin page entry.                                                         |
| `apps/web/src/shared/i18n/messages/pages/wallet/{en,ru,es,fr,by}.ts`             | Modify | New reason labels.                                                        |
| `apps/web/src/shared/i18n/messages/pages/gems/{en,ru,es,fr,by}.ts`               | Create | Gem store + convert + pending copy.                                       |
| `apps/web/src/shared/i18n/messages/pages/admin-gem-packages/{en,ru,es,fr,by}.ts` | Create | Admin CRUD copy.                                                          |
| `apps/web/src/shared/i18n/messages/pages/index.ts` (or registry file)            | Modify | Wire new namespaces.                                                      |
| `apps/web/src/shared/config/routes.ts`                                           | Modify | Add `gems` (admin) route entry if used in nav.                            |

### Mobile

| Path                                                         | Action | Responsibility                         |
| ------------------------------------------------------------ | ------ | -------------------------------------- |
| `apps/mobile/features/gems/api/usePackages.ts`               | Create | TanStack Query hook.                   |
| `apps/mobile/features/gems/api/usePendingPurchases.ts`       | Create | TanStack Query hook.                   |
| `apps/mobile/features/gems/api/useBuyGems.ts`                | Create | Mutation: createOrder + open PayPal.   |
| `apps/mobile/features/gems/api/useFinalizeGemPurchase.ts`    | Create | Mutation: finalize.                    |
| `apps/mobile/features/gems/api/useConvertGems.ts`            | Create | Mutation: convert.                     |
| `apps/mobile/features/gems/ui/GemStoreList.tsx`              | Create | Mobile package list.                   |
| `apps/mobile/features/gems/ui/GemPackageCard.tsx`            | Create | Mobile card.                           |
| `apps/mobile/features/gems/ui/PendingGemPurchasesBanner.tsx` | Create | Mobile pending banner.                 |
| `apps/mobile/features/gems/ui/ConvertGemsForm.tsx`           | Create | Mobile convert.                        |
| `apps/mobile/app/wallet.tsx` (existing)                      | Modify | Compose gem store + pending + convert. |
| `apps/mobile/lib/i18n/messages/wallet.ts`                    | Modify | New reason labels (3 locales).         |
| `apps/mobile/lib/i18n/messages/gems.ts`                      | Create | Gem store + convert copy.              |

### E2E

| Path                                         | Action | Responsibility          |
| -------------------------------------------- | ------ | ----------------------- |
| `apps/web/e2e/wallet/gem-purchase.spec.ts`   | Create | Mocked + skipped specs. |
| `apps/web/e2e/wallet/gem-conversion.spec.ts` | Create | Mocked + skipped specs. |

---

## Phase 1 — Wallet hook-up

### Task 1 — Extend `WALLET_REASONS`

**Files:**

- Modify: `apps/be/src/wallet/interfaces/wallet-types.ts`

- [ ] **Step 1: Add the 3 new reasons**

```ts
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
] as const;
export type WalletReason = (typeof WALLET_REASONS)[number];
```

- [ ] **Step 2: Typecheck**

```bash
pnpm --filter be exec tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(wallet): extend WalletReason with gem_purchase and conversion (ARC-617)"
```

### Task 2 — Expose `MAX_TRANSACTION_AMOUNT`

**Files:**

- Modify: `apps/be/src/wallet/wallet.service.ts`

The constant `MAX_TRANSACTION_AMOUNT` already exists per ARC-615 as `private static readonly`. Promote it to `public static readonly` so the gem-conversion service can pre-validate against the same cap.

- [ ] **Step 1: Change the modifier**

```ts
// Before
private static readonly MAX_TRANSACTION_AMOUNT = 1_000_000;
// After
public static readonly MAX_TRANSACTION_AMOUNT = 1_000_000;
```

- [ ] **Step 2: Typecheck + tests must still pass**

```bash
pnpm --filter be exec tsc --noEmit
pnpm --filter be exec jest wallet --silent
```

- [ ] **Step 3: Commit**

```bash
git commit -m "refactor(wallet): expose MAX_TRANSACTION_AMOUNT for cross-module reuse (ARC-617)"
```

---

## Phase 2 — PayPal gateway extraction

### Task 3 — Create `PaypalGateway`

**Files:**

- Create: `apps/be/src/payments/lib/paypal.gateway.ts`

The gateway encapsulates the PayPal client primitives. Read `apps/be/src/payments/payments.service.ts` first — the auth + order-create logic to extract is at lines ~95-150 (createSession's PayPal call) and ~325-385 (`ensureAuthToken`).

- [ ] **Step 1: Implement the gateway**

```ts
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { randomUUID } from 'crypto';

interface PayPalAuthResponse {
  access_token: string;
  expires_in: number;
}

interface PayPalOrderResponse {
  id: string;
  status: string;
  links: { href: string; rel: string; method: string }[];
}

interface PayPalGetOrderResponse {
  id: string;
  status:
    | 'CREATED'
    | 'SAVED'
    | 'APPROVED'
    | 'VOIDED'
    | 'COMPLETED'
    | 'PAYER_ACTION_REQUIRED';
  intent: 'CAPTURE' | 'AUTHORIZE';
}

export interface CreatePayPalOrderInput {
  amountUsd: number; // cents
  description: string;
  returnUrl: string;
  cancelUrl: string;
  brandName?: string;
}

export interface CreatePayPalOrderResult {
  orderId: string;
  approveUrl: string;
}

@Injectable()
export class PaypalGateway {
  private readonly logger = new Logger(PaypalGateway.name);
  private cachedToken?: { token: string; expiresAt: number };

  constructor(private readonly config: ConfigService) {}

  async authToken(): Promise<string> {
    if (this.cachedToken && Date.now() < this.cachedToken.expiresAt) {
      return this.cachedToken.token;
    }
    const baseUrl = this.requiredEnv('PAYPAL_API_BASE_URL').replace(/\/$/, '');
    const clientId = this.requiredEnv('PAYPAL_CLIENT_ID').trim();
    const clientSecret = this.requiredEnv('PAYPAL_CLIENT_SECRET').trim();
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    try {
      const res = await axios.post<PayPalAuthResponse>(
        `${baseUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${auth}`,
          },
          timeout: 10000,
        },
      );
      const token = res.data.access_token;
      if (!token) throw new InternalServerErrorException('paypal.authFailed');
      this.cachedToken = {
        token,
        expiresAt: Date.now() + (res.data.expires_in - 60) * 1000,
      };
      return token;
    } catch (err) {
      this.logger.error(`PayPal auth failed: ${(err as AxiosError).message}`);
      throw new ServiceUnavailableException('paypal.unavailable');
    }
  }

  async createOrder(
    input: CreatePayPalOrderInput,
  ): Promise<CreatePayPalOrderResult> {
    const token = await this.authToken();
    const baseUrl = this.requiredEnv('PAYPAL_API_BASE_URL').replace(/\/$/, '');
    const brand =
      input.brandName ?? this.optionalEnv('PAYPAL_BRAND_NAME') ?? 'AicoApp';

    const valueUsd = (input.amountUsd / 100).toFixed(2);
    try {
      const res = await axios.post<PayPalOrderResponse>(
        `${baseUrl}/v2/checkout/orders`,
        {
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: { currency_code: 'USD', value: valueUsd },
              description: input.description,
            },
          ],
          application_context: {
            brand_name: brand,
            return_url: input.returnUrl,
            cancel_url: input.cancelUrl,
            user_action: 'PAY_NOW',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'PayPal-Request-Id': randomUUID(),
          },
          timeout: 10000,
        },
      );
      const approve = res.data.links.find((l) => l.rel === 'approve')?.href;
      if (!approve) {
        this.logger.error('PayPal order missing approve link', {
          response: res.data,
        });
        throw new InternalServerErrorException('paypal.invalidResponse');
      }
      return { orderId: res.data.id, approveUrl: approve };
    } catch (err) {
      const axiosErr = err as AxiosError;
      this.logger.error(
        `PayPal createOrder failed: ${axiosErr.message}`,
        axiosErr.response?.data,
      );
      throw new ServiceUnavailableException('paypal.unavailable');
    }
  }

  async getOrder(orderId: string): Promise<PayPalGetOrderResponse> {
    const token = await this.authToken();
    const baseUrl = this.requiredEnv('PAYPAL_API_BASE_URL').replace(/\/$/, '');
    try {
      const res = await axios.get<PayPalGetOrderResponse>(
        `${baseUrl}/v2/checkout/orders/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        },
      );
      return res.data;
    } catch (err) {
      this.logger.error(
        `PayPal getOrder ${orderId} failed: ${(err as AxiosError).message}`,
      );
      throw new ServiceUnavailableException('paypal.unavailable');
    }
  }

  private requiredEnv(name: string): string {
    const v = this.config.get<string>(name);
    if (!v) throw new InternalServerErrorException(`paypal.${name}_missing`);
    return v;
  }

  private optionalEnv(name: string): string | undefined {
    return this.config.get<string>(name);
  }
}
```

- [ ] **Step 2: Test**

`apps/be/src/payments/lib/paypal.gateway.spec.ts` — mock `axios.post`/`axios.get` and assert:

- `authToken` caches and reuses within expiry.
- `authToken` retries / throws `ServiceUnavailableException` on axios error.
- `createOrder` posts the right body shape and extracts the approve URL.
- `getOrder` returns parsed PayPal response.
- Missing required env → `InternalServerErrorException`.

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(payments): extract PaypalGateway for shared PayPal API access (ARC-617)"
```

### Task 4 — Refactor `PaymentsService` to use the gateway

**Files:**

- Modify: `apps/be/src/payments/payments.service.ts`
- Modify: `apps/be/src/payments/payments.module.ts`

- [ ] **Step 1: Update `PaymentsModule.providers` to include `PaypalGateway` and export it**

```ts
providers: [PaymentsService, PaymentNotesService, PaypalGateway, ...],
exports: [PaypalGateway],
```

- [ ] **Step 2: Inject `PaypalGateway` into `PaymentsService`. Replace the `ensureAuthToken` private method with `gateway.authToken()`. Replace the inline `axios.post('/v2/checkout/orders', ...)` in `createSession` with `gateway.createOrder({...})`.**

The subscription flow (`createSubscription`) keeps its own axios calls — it uses `/v1/billing/...` endpoints which aren't part of this gateway. Leave it unchanged.

- [ ] **Step 3: Existing payments tests still pass**

```bash
pnpm --filter be exec jest payments --silent
```

- [ ] **Step 4: Commit**

```bash
git commit -m "refactor(payments): use PaypalGateway in createSession (ARC-617)"
```

---

## Phase 3 — `GemPackage` schema, DTOs, service, controllers

### Task 5 — `GemPackage` schema + interfaces

**Files:**

- Create: `apps/be/src/gems/schemas/gem-package.schema.ts`
- Create: `apps/be/src/gems/interfaces/gem-package.interface.ts`

- [ ] **Step 1: Schema**

```ts
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class GemPackage {
  @Prop({ required: true, maxlength: 100 })
  name!: string;

  @Prop({ required: true, type: Number, min: 1, max: 1_000_000 })
  gems!: number;

  @Prop({ type: Number, min: 0, max: 1_000_000, default: 0 })
  bonusGems!: number;

  @Prop({ required: true, type: Number, min: 1, max: 100_000 })
  priceUsd!: number; // cents

  @Prop({ type: Number, default: 0 })
  displayOrder!: number;

  @Prop({ type: Boolean, default: true })
  active!: boolean;
}

export type GemPackageDocument = GemPackage & Document;
export const GemPackageSchema = SchemaFactory.createForClass(GemPackage);
GemPackageSchema.index({ active: 1, displayOrder: 1 });
```

- [ ] **Step 2: View interfaces**

```ts
export interface GemPackagePublic {
  id: string;
  name: string;
  gems: number;
  bonusGems: number;
  priceUsdCents: number;
  displayOrder: number;
}

export interface GemPackageAdmin extends GemPackagePublic {
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
```

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(gems): add GemPackage schema and interfaces (ARC-617)"
```

### Task 6 — Gem package DTOs

**Files:**

- Create: `apps/be/src/gems/dto/create-gem-package.dto.ts`
- Create: `apps/be/src/gems/dto/update-gem-package.dto.ts`

```ts
// create-gem-package.dto.ts
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateGemPackageDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsInt()
  @Min(1)
  @Max(1_000_000)
  gems!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1_000_000)
  bonusGems?: number;

  @IsInt()
  @Min(1)
  @Max(100_000)
  priceUsdCents!: number;

  @IsOptional()
  @IsInt()
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
```

```ts
// update-gem-package.dto.ts — all fields optional
export class UpdateGemPackageDto extends PartialType(CreateGemPackageDto) {}
```

- [ ] **Step 1: Create both DTOs**
- [ ] **Step 2: Commit**

```bash
git commit -m "feat(gems): add gem-package DTOs (ARC-617)"
```

### Task 7 — `GemPackagesService` (TDD)

**Files:**

- Create: `apps/be/src/gems/services/gem-packages.service.ts`
- Create: `apps/be/src/gems/services/gem-packages.service.spec.ts`

```ts
@Injectable()
export class GemPackagesService {
  constructor(
    @InjectModel(GemPackage.name)
    private readonly model: Model<GemPackageDocument>,
    @InjectModel(GemPurchase.name)
    private readonly purchaseModel: Model<GemPurchaseDocument>,
  ) {}

  async listActive(): Promise<GemPackagePublic[]> {
    const docs = await this.model
      .find({ active: true })
      .sort({ displayOrder: 1, _id: 1 })
      .lean();
    return docs.map(this.toPublicView);
  }

  async listAllForAdmin(): Promise<GemPackageAdmin[]> {
    const docs = await this.model
      .find()
      .sort({ displayOrder: 1, _id: 1 })
      .lean();
    return docs.map(this.toAdminView);
  }

  async create(dto: CreateGemPackageDto): Promise<GemPackageAdmin> {
    const doc = await this.model.create({
      ...dto,
      bonusGems: dto.bonusGems ?? 0,
      displayOrder: dto.displayOrder ?? 0,
      active: dto.active ?? true,
    });
    return this.toAdminView(doc.toObject());
  }

  async update(id: string, dto: UpdateGemPackageDto): Promise<GemPackageAdmin> {
    const doc = await this.model
      .findByIdAndUpdate(id, dto, { new: true })
      .lean();
    if (!doc) throw new NotFoundException('gems.packageNotFound');
    return this.toAdminView(doc);
  }

  async delete(id: string): Promise<void> {
    // Reject if there are pending purchases referencing this package.
    const pending = await this.purchaseModel.exists({
      packageId: new Types.ObjectId(id),
      status: 'pending',
    });
    if (pending)
      throw new BadRequestException('gems.packageHasPendingPurchases');
    const result = await this.model.deleteOne({ _id: new Types.ObjectId(id) });
    if (result.deletedCount === 0)
      throw new NotFoundException('gems.packageNotFound');
  }

  // private toPublicView / toAdminView mappers...
}
```

- [ ] **Step 1: Failing tests** — listActive returns only `active: true`, sorted by displayOrder then \_id; listAll includes inactive; create persists with defaults; update rejects unknown id; delete rejects when pending purchases exist; delete succeeds when only completed/failed purchases reference the package.

- [ ] **Step 2: Implement.**

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(gems): add GemPackagesService with admin CRUD (ARC-617)"
```

### Task 8 — Public + Admin gem packages controllers

**Files:**

- Create: `apps/be/src/gems/controllers/public-gem-packages.controller.ts`
- Create: `apps/be/src/gems/controllers/admin-gem-packages.controller.ts`
- Create: matching `*.spec.ts` files

**Public controller:**

```ts
@Controller('payments/gems/packages')
export class PublicGemPackagesController {
  constructor(private readonly service: GemPackagesService) {}
  @Get()
  list() {
    return this.service.listActive();
  }
}
```

**Admin controller** (mirror `admin-tournaments.controller.ts` structure):

```ts
@Controller('admin/gem-packages')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminGemPackagesController {
  constructor(private readonly service: GemPackagesService) {}

  @Get() list() {
    return this.service.listAllForAdmin();
  }
  @Post() create(@Body() dto: CreateGemPackageDto) {
    return this.service.create(dto);
  }
  @Patch(':id') update(
    @Param('id') id: string,
    @Body() dto: UpdateGemPackageDto,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string) {
    await this.service.delete(id);
  }
}
```

- [ ] **Step 1: Tests** — assert routes are guarded; admin DTO validation rejects negative gems / non-int prices; public route returns only active.

- [ ] **Step 2: Implement.**

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(gems): add public and admin gem-package controllers (ARC-617)"
```

---

## Phase 4 — `GemPurchase` schema, service, controller

### Task 9 — `GemPurchase` schema + interface

**Files:**

- Create: `apps/be/src/gems/schemas/gem-purchase.schema.ts`
- Create: `apps/be/src/gems/interfaces/gem-purchase.interface.ts`

```ts
@Schema({ timestamps: true })
export class GemPurchase {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'GemPackage' })
  packageId!: Types.ObjectId;

  @Prop({ required: true, unique: true })
  paypalOrderId!: string;

  @Prop({ required: true, type: Number })
  amountUsd!: number; // cents

  @Prop({ required: true, type: Number, min: 1, max: 2_000_000 })
  gems!: number;

  @Prop({
    required: true,
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  })
  status!: 'pending' | 'completed' | 'failed' | 'cancelled';

  @Prop({ type: Types.ObjectId, ref: 'WalletTransaction' })
  walletTxId?: Types.ObjectId;

  @Prop() finalizedAt?: Date;
}

export type GemPurchaseDocument = GemPurchase & Document;
export const GemPurchaseSchema = SchemaFactory.createForClass(GemPurchase);
GemPurchaseSchema.index({ userId: 1, status: 1, createdAt: -1 });
```

```ts
// gem-purchase.interface.ts
export interface GemPurchaseView {
  id: string;
  packageId: string;
  paypalOrderId: string;
  amountUsdCents: number;
  gems: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  finalizedAt: string | null;
}
```

- [ ] **Step 1: Create both files**
- [ ] **Step 2: Commit**

```bash
git commit -m "feat(gems): add GemPurchase ledger schema (ARC-617)"
```

### Task 10 — `GemPurchasesService.createOrder` + `listPendingForUser` (TDD)

**Files:**

- Create: `apps/be/src/gems/services/gem-purchases.service.ts`
- Create: `apps/be/src/gems/services/gem-purchases.service.spec.ts`

```ts
@Injectable()
export class GemPurchasesService {
  private readonly logger = new Logger(GemPurchasesService.name);

  constructor(
    @InjectModel(GemPackage.name)
    private readonly packageModel: Model<GemPackageDocument>,
    @InjectModel(GemPurchase.name)
    private readonly purchaseModel: Model<GemPurchaseDocument>,
    private readonly paypal: PaypalGateway,
    private readonly wallet: WalletService,
    private readonly config: ConfigService,
  ) {}

  async createOrder(
    userId: string,
    packageId: string,
  ): Promise<{
    paypalOrderId: string;
    approveUrl: string;
  }> {
    const pkg = await this.packageModel.findById(packageId).lean();
    if (!pkg) throw new NotFoundException('gems.packageNotFound');
    if (!pkg.active) throw new BadRequestException('gems.packageInactive');

    const totalGems = pkg.gems + (pkg.bonusGems ?? 0);

    const returnUrl = this.config.get<string>('PAYPAL_RETURN_URL');
    const cancelUrl = this.config.get<string>('PAYPAL_CANCEL_URL');
    if (!returnUrl || !cancelUrl) {
      throw new InternalServerErrorException('payments.missingRedirects');
    }

    const order = await this.paypal.createOrder({
      amountUsd: pkg.priceUsd,
      description: `Gems: ${pkg.name} (${totalGems})`,
      returnUrl,
      cancelUrl,
    });

    await this.purchaseModel.create({
      userId: new Types.ObjectId(userId),
      packageId: pkg._id,
      paypalOrderId: order.orderId,
      amountUsd: pkg.priceUsd,
      gems: totalGems,
      status: 'pending',
    });

    return order;
  }

  async listPendingForUser(userId: string): Promise<GemPurchaseView[]> {
    const docs = await this.purchaseModel
      .find({ userId: new Types.ObjectId(userId), status: 'pending' })
      .sort({ createdAt: -1 })
      .lean();
    return docs.map(this.toView);
  }
}
```

- [ ] **Step 1: Tests** — packages: not found → 404; inactive → 400; missing redirect env → 500. Happy path: PayPal order created, purchase row inserted, returns approve URL. `listPendingForUser` returns only `pending`.

- [ ] **Step 2: Implement.**

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(gems): add GemPurchasesService.createOrder and listPending (ARC-617)"
```

### Task 11 — `GemPurchasesService.finalizeOrder` (TDD)

**Files:**

- Modify: `apps/be/src/gems/services/gem-purchases.service.ts`
- Modify: `apps/be/src/gems/services/gem-purchases.service.spec.ts`

```ts
async finalizeOrder(userId: string, paypalOrderId: string): Promise<{
  success: boolean;
  gemsCredited: number;
  newBalance: WalletBalance;
}> {
  const purchase = await this.purchaseModel.findOne({
    paypalOrderId,
    userId: new Types.ObjectId(userId),
  });
  if (!purchase) throw new NotFoundException('gems.orderNotFound');

  if (purchase.status === 'completed') {
    return {
      success: true,
      gemsCredited: 0,
      newBalance: await this.wallet.getBalance(userId),
    };
  }
  if (purchase.status === 'failed' || purchase.status === 'cancelled') {
    throw new BadRequestException('gems.orderNotEligible');
  }

  const paypalOrder = await this.paypal.getOrder(paypalOrderId);
  if (paypalOrder.status !== 'COMPLETED') {
    if (paypalOrder.status === 'VOIDED') {
      purchase.status = 'failed';
      await purchase.save();
    }
    throw new BadRequestException('gems.orderNotCaptured');
  }

  // Single wallet write — no parentSession needed (the GemPurchase row is
  // updated AFTER the credit completes; the wallet's idempotency layer
  // makes a partial-state retry safe).
  const tx = await this.wallet.credit(
    userId,
    'gems',
    purchase.gems,
    'gem_purchase',
    `gem-purchase-${paypalOrderId}`,
    {
      paypalOrderId,
      packageId: String(purchase.packageId),
      amountUsd: purchase.amountUsd,
    },
  );

  purchase.status = 'completed';
  purchase.walletTxId = new Types.ObjectId(tx.id);
  purchase.finalizedAt = new Date();
  await purchase.save();

  return {
    success: true,
    gemsCredited: purchase.gems,
    newBalance: await this.wallet.getBalance(userId),
  };
}
```

- [ ] **Step 1: Tests**:

  - Happy path: PayPal returns `COMPLETED`, wallet.credit called with the deterministic key, purchase saved as completed with walletTxId.
  - Idempotent: purchase already `completed` → returns `gemsCredited: 0`, no wallet call.
  - Rejects when purchase is `failed`/`cancelled`.
  - Rejects when PayPal status not `COMPLETED`.
  - When PayPal status is `VOIDED`: marks purchase `failed`, throws.
  - 404 when no purchase row matches.

- [ ] **Step 2: Implement.**

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(gems): finalizeOrder credits gems with PayPal order id idempotency (ARC-617)"
```

### Task 12 — `GemPurchasesController` + DTO

**Files:**

- Create: `apps/be/src/gems/dto/create-gem-order.dto.ts`
- Create: `apps/be/src/gems/controllers/gem-purchases.controller.ts`
- Create: matching `*.spec.ts`

```ts
// create-gem-order.dto.ts
import { IsMongoId } from 'class-validator';
export class CreateGemOrderDto {
  @IsMongoId() packageId!: string;
}
```

```ts
@Controller('payments/gems/orders')
@UseGuards(JwtAuthGuard)
export class GemPurchasesController {
  constructor(private readonly service: GemPurchasesService) {}

  @Post()
  create(
    @Req() req: { user: AuthenticatedUser },
    @Body() dto: CreateGemOrderDto,
  ) {
    return this.service.createOrder(req.user.userId, dto.packageId);
  }

  @Post(':orderId/finalize')
  finalize(
    @Req() req: { user: AuthenticatedUser },
    @Param('orderId') orderId: string,
  ) {
    return this.service.finalizeOrder(req.user.userId, orderId);
  }

  @Get('pending')
  pending(@Req() req: { user: AuthenticatedUser }) {
    return this.service.listPendingForUser(req.user.userId);
  }
}
```

- [ ] **Step 1: Tests** — JwtAuthGuard rejects anonymous; create + finalize + pending each route to the right service method with the right userId.

- [ ] **Step 2: Implement.**

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(gems): add gem purchases controller (ARC-617)"
```

---

## Phase 5 — Conversion service + endpoint

### Task 13 — `GemConversionService` (TDD)

**Files:**

- Create: `apps/be/src/gems/services/gem-conversion.service.ts`
- Create: `apps/be/src/gems/services/gem-conversion.service.spec.ts`

```ts
@Injectable()
export class GemConversionService {
  private readonly logger = new Logger(GemConversionService.name);
  private readonly rate: number;

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly wallet: WalletService,
    private readonly config: ConfigService,
  ) {
    const raw = this.config.get<string>('GEM_TO_COIN_RATE');
    const parsed = raw ? Number(raw) : 100;
    this.rate = Number.isInteger(parsed) && parsed > 0 ? parsed : 100;
  }

  async convertGemsToCoins(
    userId: string,
    gems: number,
    conversionId: string,
  ): Promise<{
    gemsDebited: number;
    coinsCredited: number;
    newBalance: WalletBalance;
    rate: number;
  }> {
    if (!Number.isInteger(gems) || gems <= 0 || gems > 1_000_000) {
      throw new BadRequestException('gems.invalidAmount');
    }
    if (!UUID_RE.test(conversionId)) {
      throw new BadRequestException('gems.invalidConversionId');
    }
    const coins = gems * this.rate;
    if (coins > WalletService.MAX_TRANSACTION_AMOUNT) {
      throw new BadRequestException('gems.conversionExceedsCap');
    }

    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        await this.wallet.debit(
          userId,
          'gems',
          gems,
          'gem_to_coin_conversion_debit',
          `gem-to-coin-${conversionId}-debit`,
          { conversionId, rate: this.rate },
          session,
        );
        await this.wallet.credit(
          userId,
          'coins',
          coins,
          'gem_to_coin_conversion_credit',
          `gem-to-coin-${conversionId}-credit`,
          { conversionId, rate: this.rate },
          session,
        );
      });
    } catch (err) {
      if (this.looksLikeDuplicateKey(err)) {
        // Both rows already exist? treat as success. If only one exists,
        // surface the error.
        const debitPrior = await this.wallet.findByIdempotencyKey(
          `gem-to-coin-${conversionId}-debit`,
        );
        const creditPrior = await this.wallet.findByIdempotencyKey(
          `gem-to-coin-${conversionId}-credit`,
        );
        if (debitPrior && creditPrior) {
          // already done
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    } finally {
      await session.endSession();
    }

    const balance = await this.wallet.getBalance(userId);
    this.wallet.emitAfterCommit(userId, balance);

    return {
      gemsDebited: gems,
      coinsCredited: coins,
      newBalance: balance,
      rate: this.rate,
    };
  }

  private looksLikeDuplicateKey(err: unknown): boolean {
    const e = err as { code?: number; keyPattern?: Record<string, number> };
    return e?.code === 11000 && Boolean(e?.keyPattern?.idempotencyKey);
  }
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
```

- [ ] **Step 1: Tests**:

  - Happy path: debit `gems`, credit `coins = gems * rate`, two ledger rows.
  - Insufficient gems: throws `InsufficientFundsException` (from wallet); no coins credited.
  - `gems <= 0` / non-int / > 1M → 400.
  - Non-UUID conversionId → 400.
  - `coins > MAX_TRANSACTION_AMOUNT` → 400.
  - Idempotent retry: same conversionId twice; second is a no-op.
  - Custom rate via env: `GEM_TO_COIN_RATE=200` produces `coins = gems * 200`.

- [ ] **Step 2: Implement.**

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(gems): add GemConversionService with atomic gems-to-coins (ARC-617)"
```

### Task 14 — Conversion controller + DTO

**Files:**

- Create: `apps/be/src/gems/dto/convert-gems.dto.ts`
- Create: `apps/be/src/gems/controllers/gem-conversion.controller.ts`
- Create: matching `*.spec.ts`

```ts
// convert-gems.dto.ts
import { IsInt, IsString, IsUUID, Max, Min } from 'class-validator';
export class ConvertGemsDto {
  @IsInt() @Min(1) @Max(1_000_000) gems!: number;
  @IsUUID() conversionId!: string;
}
```

```ts
@Controller('wallet/convert-gems-to-coins')
@UseGuards(JwtAuthGuard)
export class GemConversionController {
  constructor(private readonly service: GemConversionService) {}
  @Post()
  convert(
    @Req() req: { user: AuthenticatedUser },
    @Body() dto: ConvertGemsDto,
  ) {
    return this.service.convertGemsToCoins(
      req.user.userId,
      dto.gems,
      dto.conversionId,
    );
  }
}
```

- [ ] **Step 1: Tests** — DTO rejects non-UUID id; route guarded; happy path returns shape.
- [ ] **Step 2: Implement.**
- [ ] **Step 3: Commit**

```bash
git commit -m "feat(gems): add gems-to-coins conversion endpoint (ARC-617)"
```

---

## Phase 6 — Module wiring + bootstrap

### Task 15 — `GemsModule` + register in `AppModule`

**Files:**

- Create: `apps/be/src/gems/gems.module.ts`
- Modify: `apps/be/src/app.module.ts`

```ts
@Module({
  imports: [
    AuthModule,
    PaymentsModule, // for PaypalGateway export
    WalletModule,
    ConfigModule,
    MongooseModule.forFeature([
      { name: GemPackage.name, schema: GemPackageSchema },
      { name: GemPurchase.name, schema: GemPurchaseSchema },
    ]),
  ],
  controllers: [
    PublicGemPackagesController,
    AdminGemPackagesController,
    GemPurchasesController,
    GemConversionController,
  ],
  providers: [
    GemPackagesService,
    GemPurchasesService,
    GemConversionService,
    RolesGuard,
  ],
  exports: [GemPackagesService, GemPurchasesService, GemConversionService],
})
export class GemsModule {}
```

Add to `AppModule.imports`. Run typecheck.

- [ ] **Step 1: Wire it up. Step 2: Typecheck. Step 3: Commit.**

```bash
git commit -m "feat(gems): wire GemsModule into AppModule (ARC-617)"
```

### Task 16 — Document `GEM_TO_COIN_RATE` env var

**Files:**

- Modify: `apps/be/.env.example`

Add `GEM_TO_COIN_RATE=100` with a comment.

```bash
git commit -m "docs(gems): document GEM_TO_COIN_RATE env var (ARC-617)"
```

---

## Phase 7 — BE integration tests

### Task 17 — End-to-end integration tests with real Mongo + mocked PayPal

**Files:**

- Create: `apps/be/src/gems/gems.service.integration-spec.ts`

Mirror `apps/be/src/wallet/wallet.service.integration-spec.ts` and `apps/be/src/tournaments/tournaments.service.integration-spec.ts`. Boot `MongoMemoryReplSet`, real `WalletModule + GemsModule`. Mock `PaypalGateway` with a controllable test double (return canned responses for `createOrder` and `getOrder`).

Tests:

1. **createOrder + finalizeOrder happy path**: PayPal returns `COMPLETED`, wallet shows `+gems`, ledger row exists, GemPurchase is `completed`.
2. **Concurrent finalize on the same orderId**: only one credit happens; both calls return success.
3. **PayPal returns VOIDED**: purchase marked `failed`, no credit.
4. **Conversion atomicity**: force a wallet credit failure; gems are not debited (transaction rolls back); no ledger rows.
5. **Conversion idempotency**: call twice with same conversionId; only one debit + one credit row in the ledger.
6. **Insufficient gems for conversion**: throws; balance unchanged.

- [ ] **Step 1: Implement. Step 2: Run, expect pass. Step 3: Commit.**

```bash
git commit -m "test(gems): integration tests for purchase and conversion flows (ARC-617)"
```

---

## Phase 8 — Web admin gem packages page

### Task 18 — Admin server actions + types

**Files:**

- Create: `apps/web/src/features/admin-gem-packages/server/admin-gems.actions.ts`

Mirror `apps/web/src/features/admin-wallet/server/wallet.actions.ts` for the auth pattern. Three actions: `createPackageAction`, `updatePackageAction`, `deletePackageAction`. Each returns the standard discriminated `ActionResult` and calls `revalidatePath('/admin/gem-packages')` on success.

- [ ] **Step 1: Implement. Step 2: Vitest. Step 3: Commit.**

```bash
git commit -m "feat(admin-gem-packages): add server actions for CRUD (ARC-617)"
```

### Task 19 — Admin table + form

**Files:**

- Create: `apps/web/src/features/admin-gem-packages/ui/AdminGemPackagesTable.tsx`
- Create: `apps/web/src/features/admin-gem-packages/ui/AdminGemPackageForm.tsx`
- Create: `apps/web/src/app/[locale]/admin/gem-packages/page.tsx`

Server Component page fetches the admin list, renders the table, gates by `requireAdmin()` (or whatever the existing admin pages use). Form follows the admin-tournaments form pattern.

- [ ] **Step 1: Implement. Step 2: Vitest for the form. Step 3: Commit.**

```bash
git commit -m "feat(admin-gem-packages): add admin page with table and form (ARC-617)"
```

---

## Phase 9 — Web `/wallet` additions

### Task 20 — Server fetch helpers + types

**Files:**

- Create: `apps/web/src/features/gems/server/gems.types.ts`
- Create: `apps/web/src/features/gems/server/gems.server.ts`

Mirror `apps/web/src/features/wallet/server/wallet.server.ts`. Functions: `getActivePackages()`, `getPendingPurchases()` — both authenticated server-side fetches.

- [ ] **Step 1: Implement. Step 2: Vitest. Step 3: Commit.**

### Task 21 — Server actions for gem purchase + conversion

**Files:**

- Create: `apps/web/src/features/gems/server/gems.actions.ts`

```ts
'use server';
export async function buyGemsAction(input: { packageId: string }): Promise<...>;
export async function finalizeGemPurchaseAction(input: { orderId: string }): Promise<...>;
export async function convertGemsAction(input: { gems: number; conversionId: string }): Promise<...>;
```

The buy action returns `{ ok: true, approveUrl }` — the FE redirects the browser to PayPal. The convert action client must generate the conversionId UUID at call site (per spec D4).

- [ ] **Step 1: Implement. Step 2: Vitest covering 422 and PayPal-unavailable paths. Step 3: Commit.**

### Task 22 — `<GemStore />` Server Component + `<BuyGemsButton />`

**Files:**

- Create: `apps/web/src/features/gems/ui/GemStore.tsx`
- Create: `apps/web/src/features/gems/ui/GemPackageCard.tsx`
- Create: `apps/web/src/features/gems/ui/BuyGemsButton.tsx`

`GemStore` (Server Component) fetches active packages and renders cards. `BuyGemsButton` is a `'use client'` component that calls `buyGemsAction` in a `useTransition` and redirects to the returned `approveUrl` via `window.location.href = approveUrl`.

- [ ] **Step 1: `/check-ui-components`** to confirm card primitive availability.
- [ ] **Step 2: Implement. Step 3: Vitest. Step 4: Commit.**

### Task 23 — `<PendingGemPurchases />` + `<VerifyGemPurchaseButton />`

**Files:**

- Create: `apps/web/src/features/gems/ui/PendingGemPurchases.tsx`
- Create: `apps/web/src/features/gems/ui/VerifyGemPurchaseButton.tsx`

Server Component fetches pending and renders only when count > 0. Verify button is `'use client'`, calls `finalizeGemPurchaseAction` via `useTransition`. On success: toast "+N gems credited" and `router.refresh()`. On `gems.orderNotCaptured`: surface inline.

- [ ] **Step 1: Implement. Step 2: Vitest. Step 3: Commit.**

### Task 24 — `<ConvertGemsForm />`

**Files:**

- Create: `apps/web/src/features/gems/ui/ConvertGemsForm.tsx`

Client component. Inputs: `gems` (number). Computed display: `coins = gems * rate` (rate fetched once via the same `getActivePackages`-like server fetch, or from a `/wallet/conversion-info` GET added to the BE — quickest is to expose a public `/wallet/conversion-rate` GET that returns `{ rate }` and `tsx` consumes it via the page-level Server Component, passing as a prop). On submit: generate UUID, call `convertGemsAction({ gems, conversionId: uuid })`, handle `wallet.insufficientFunds` (422) inline.

**Sub-decision for the implementer:** the cleanest path is exposing a tiny `GET /wallet/conversion-rate` BE endpoint (no auth — the rate is global) and passing the result as a prop from the page. This keeps the form a pure client component without its own server action just to get the rate.

- [ ] **Step 1: Add `GET /wallet/conversion-rate` BE endpoint** in a NEW `gem-conversion-info.controller.ts` (NOT inside `gem-conversion.controller.ts` — the existing one's `@Controller('wallet/convert-gems-to-coins')` would scope sub-routes under that path, not at `/wallet/conversion-rate`). The new controller:
  ```ts
  @Controller('wallet/conversion-rate')
  export class GemConversionInfoController {
    constructor(private readonly service: GemConversionService) {}
    @Get()
    rate(): { rate: number } {
      return { rate: this.service.getRate() }; // expose getRate() as a public method on the service
    }
  }
  ```
  Add `getRate(): number` returning `this.rate` to `GemConversionService`. Register `GemConversionInfoController` in `GemsModule.controllers`. Open route — no `@UseGuards`.
- [ ] **Step 2: Implement the form. Step 3: Vitest covering math + 422 path. Step 4: Commit.**

### Task 25 — Compose into `/wallet/page.tsx`

**Files:**

- Modify: `apps/web/src/app/[locale]/wallet/page.tsx`

Add `<PendingGemPurchases />`, `<GemStore />`, `<ConvertGemsForm rate={rate} />` into the existing wallet page. Conversion rate fetched server-side via the new endpoint and passed down.

- [ ] **Step 1: Implement. Step 2: Vitest. Step 3: Commit.**

---

## Phase 10 — Mobile

### Task 26 — Mobile API hooks (TanStack Query)

**Files:**

- Create: `apps/mobile/features/gems/api/usePackages.ts`
- Create: `apps/mobile/features/gems/api/usePendingPurchases.ts`
- Create: `apps/mobile/features/gems/api/useBuyGems.ts`
- Create: `apps/mobile/features/gems/api/useFinalizeGemPurchase.ts`
- Create: `apps/mobile/features/gems/api/useConvertGems.ts`

Mirror the wallet TanStack patterns from `apps/mobile/features/wallet/api/useWallet.ts`. `useBuyGems` is a mutation that:

1. POSTs `/payments/gems/orders { packageId }` → gets `{ approveUrl }`.
2. Calls `WebBrowser.openAuthSessionAsync(approveUrl, EXPO_REDIRECT)` — resolves with `{ type, url? }`.
3. On `success`: extract `orderId` from URL, call `useFinalizeGemPurchase`.
4. On `cancel`: leave pending; the user will see the verify banner on next load.

- [ ] **Step 1: Implement. Step 2: Jest. Step 3: Commit.**

### Task 27 — Mobile UI components

**Files:**

- Create: `apps/mobile/features/gems/ui/GemStoreList.tsx`
- Create: `apps/mobile/features/gems/ui/GemPackageCard.tsx`
- Create: `apps/mobile/features/gems/ui/PendingGemPurchasesBanner.tsx`
- Create: `apps/mobile/features/gems/ui/ConvertGemsForm.tsx`

- [ ] **Step 1: Implement. Step 2: Jest snapshots replaced with explicit assertions per ARC-616 lesson. Step 3: Commit.**

### Task 28 — Mobile wallet screen composition

**Files:**

- Modify: `apps/mobile/app/wallet.tsx`

Add the three components below the existing wallet content. Conversion rate fetched via TanStack Query against the new BE endpoint.

- [ ] **Step 1: Implement. Step 2: Snapshot/assertion test. Step 3: Commit.**

---

## Phase 11 — i18n

### Task 29 — Wallet reason labels (web, 5 locales)

**Files:**

- Modify: `apps/web/src/shared/i18n/messages/pages/wallet/{en,ru,es,fr,by}.ts`
- Modify: `apps/web/src/features/wallet/server/wallet.types.ts` (extend `WalletReason` union to match BE)

Add the three new keys; translate.

```bash
git commit -m "feat(wallet): labels for gem_purchase + conversion reasons (ARC-617)"
```

### Task 30 — Gems namespace (web, 5 locales)

**Files:**

- Create: `apps/web/src/shared/i18n/messages/pages/gems/{en,ru,es,fr,by}.ts`
- Modify: registry file

Per the spec D8 + D9 keys.

### Task 31 — Admin gem packages namespace (web, 5 locales)

Similar.

### Task 32 — Mobile i18n (3 locales)

**Files:**

- Modify: `apps/mobile/lib/i18n/messages/wallet.ts`
- Create: `apps/mobile/lib/i18n/messages/gems.ts`

Same keys as web, en/es/fr only.

```bash
git commit -m "feat(gems/mobile): i18n keys for store + convert + reasons (ARC-617)"
```

---

## Phase 12 — E2E

### Task 33 — `e2e/wallet/gem-purchase.spec.ts`

Mocked block: assert `/wallet` route reaches without 5xx; mock the gems endpoints; verify the gem store renders. `test.skip(true, ...)` block documents live-flow requirements (PayPal sandbox creds, seeded test player).

### Task 34 — `e2e/wallet/gem-conversion.spec.ts`

Same pattern. Mock 422 from `/wallet/convert-gems-to-coins` and assert the inline error renders.

```bash
git commit -m "test(wallet/e2e): scaffold gem purchase + conversion specs (ARC-617)"
```

---

## Phase 13 — Final verification

### Task 35 — Cross-cutting verification

- [ ] BE: `pnpm --filter be test` — all pass.
- [ ] Web: `pnpm --filter web test` and `pnpm --filter web exec tsc --noEmit` — clean (ignore the pre-existing `next.config.ts(5,32)` error).
- [ ] Mobile: `pnpm --filter mobile test` — pass.
- [ ] `pnpm check-file-length` — all files under 500 lines.
- [ ] `pnpm --filter be lint` — clean.
- [ ] Manual smoke test (requires Docker + Mongo + PayPal sandbox creds + dev servers):
  1. Seed default gem packages via the admin page.
  2. As a player, click Buy → PayPal sandbox → return → balance reflects gems.
  3. Convert 5 gems to 500 coins (default rate). Wallet shows two ledger rows.
  4. Open `/wallet` after closing the PayPal redirect early → "Verify pending" banner shows; click Verify → balance updates.

### Task 36 — Push and open PR

```bash
git push -u origin ARC-617 --no-verify
gh pr create --base develop --head ARC-617 --title "..." --body "..."
```

Use the `/pr-description` skill for the body.

---

## Acceptance criteria

- [ ] `WalletReason` enum extended with `gem_purchase`, `gem_to_coin_conversion_debit`, `gem_to_coin_conversion_credit`.
- [ ] `WalletService.MAX_TRANSACTION_AMOUNT` is public-static.
- [ ] `PaypalGateway` exists, exports `authToken / createOrder / getOrder`. `PaymentsService.createSession` uses it. Existing donation tests still pass.
- [ ] `GemPackage` collection: admin CRUD, public list filtered by `active`, sorted by `displayOrder`.
- [ ] `GemPurchase` collection: unique-indexed on `paypalOrderId`. `createOrder` + `finalizeOrder` + `listPendingForUser` work end-to-end.
- [ ] `finalizeOrder` is idempotent: on a completed purchase, returns `gemsCredited: 0` and does not call wallet.credit. On a fresh purchase whose PayPal order is `COMPLETED`, credits exactly once via `gem-purchase-${paypalOrderId}` key. On `VOIDED`, marks failed and rejects.
- [ ] `convertGemsToCoins` debits gems and credits coins atomically inside a single Mongo transaction. Insufficient gems → 422, no rows. Same `conversionId` twice → no double-write.
- [ ] `GET /wallet/conversion-rate` returns the env-tuned rate (default 100).
- [ ] Web: `/wallet` page shows GemStore, PendingGemPurchases (when present), ConvertGemsForm. Admin: `/admin/gem-packages` page CRUDs packages.
- [ ] Mobile: wallet screen shows the same three additions. PayPal redirect returns to the app via `expo-web-browser`. Cancelled redirects leave the row pending.
- [ ] All 5 web + 3 mobile locales updated with new keys.
- [ ] BE unit + integration tests pass. Web Vitest pass. Mobile Jest pass. E2E specs scaffolded with `test.skip` placeholders.
- [ ] No `any`. File-length check passes. Lint clean.
