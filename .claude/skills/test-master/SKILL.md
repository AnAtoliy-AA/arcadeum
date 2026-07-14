---
name: test-master
description: Write comprehensive unit, integration, and E2E tests with proper mocking, assertions, and coverage. Use when creating test suites, mocking dependencies, or improving test coverage. Trigger on keywords like test, unit test, integration test, mocking, coverage, vitest, jest, playwright.
---

# Test Master

## When to Use

- Writing unit tests for services/components
- Creating integration tests for APIs
- Setting up E2E tests with Playwright
- Mocking dependencies
- Improving test coverage

## Testing Stack

- **Backend**: Jest (`pnpm test` in `apps/be`)
- **Web**: Vitest (`pnpm test` in `apps/web`)
- **E2E**: Playwright (`pnpm test:e2e` in `apps/web`)
- **Mobile**: Jest (`pnpm test` in `apps/mobile`)

## Unit Testing Patterns

### NestJS Service Test

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { GamesService } from './games.service';
import { Game } from './schemas/game.schema';

const mockGameModel = {
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

describe('GamesService', () => {
  let service: GamesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamesService,
        { provide: getModelToken(Game.name), useValue: mockGameModel },
      ],
    }).compile();

    service = module.get<GamesService>(GamesService);
    jest.clearAllMocks();
  });

  it('should return a game by id', async () => {
    const mockGame = { _id: '123', name: 'Chess' };
    mockGameModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockGame),
    });

    const result = await service.findOne('123');
    expect(result).toEqual(mockGame);
  });

  it('should throw NotFoundException for invalid id', async () => {
    mockGameModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(service.findOne('invalid')).rejects.toThrow();
  });
});
```

### React Component Test

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByText('Click')).toBeDisabled();
  });
});
```

### Zustand Store Test

```typescript
import { renderHook, act } from '@testing-library/react';
import { useGameStore } from './gameStore';

describe('gameStore', () => {
  beforeEach(() => {
    useGameStore.setState({ games: [], loading: false });
  });

  it('adds a game', () => {
    const { result } = renderHook(() => useGameStore());
    act(() => {
      result.current.addGame({ id: '1', name: 'Chess' });
    });
    expect(result.current.games).toHaveLength(1);
  });
});
```

## Mocking Patterns

### Mock Mongoose Model

```typescript
const mockModel = {
  find: jest.fn().mockReturnThis(),
  findById: jest.fn().mockReturnThis(),
  findOne: jest.fn().mockReturnThis(),
  create: jest.fn(),
  save: jest.fn(),
  exec: jest.fn(),
  sort: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
};
```

### Mock External Service

```typescript
const mockPaymentService = {
  createOrder: jest.fn().mockResolvedValue({ id: 'order-1' }),
  capturePayment: jest.fn().mockResolvedValue({ status: 'captured' }),
};

// In test setup
{ provide: PaymentService, useValue: mockPaymentService }
```

### Mock API Response

```typescript
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: 'mocked' }),
  })
);
```

## E2E Testing with Playwright

```typescript
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('/en/auth');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/.*dashboard/);
});
```

## Test Coverage

```bash
# Backend
pnpm test -- --coverage

# Web
pnpm test -- --coverage

# Check coverage thresholds
pnpm test -- --coverage --coverageThreshold='{"global":{"lines":80}}'
```

## Best Practices

### DO
- Test one thing per test case
- Use descriptive test names
- Mock external dependencies
- Test edge cases and error states
- Use `beforeEach` for setup
- Clean up mocks after tests

### DON'T
- Test implementation details
- Use `any` type in tests
- Skip testing error paths
- Leave tests in broken state
- Hardcode test data
- Depend on test execution order

## File Naming

- Backend: `*.spec.ts` or `*.test.ts`
- Web: `*.test.tsx` or `*.test.ts`
- E2E: `*.spec.ts` in `e2e/` directory

## Project Conventions

- Backend tests in `apps/be/src/**/*.spec.ts`
- Web tests in `apps/web/src/**/*.test.ts`
- E2E tests in `apps/web/e2e/*.spec.ts`
- Use `describe` blocks for grouping
- Use `it` (not `test`) for test cases
