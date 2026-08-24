import { ConfigService } from '@nestjs/config';
import { Bot } from 'grammy';
import { HealthMonitorService } from './health-monitor.service';

jest.mock('grammy', () => ({
  Bot: jest.fn().mockImplementation(() => ({
    api: {
      sendMessage: jest.fn((_chat: string, text: string) => {
        mockSent.push(text.split('\n'));
        return Promise.resolve(undefined);
      }),
    },
  })),
}));

type FetchResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

function jsonResponse(status: number, body: unknown): FetchResponse {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  };
}

function healthyDb(): FetchResponse {
  return jsonResponse(200, {
    ok: true,
    mongo: { oci: 'connected', atlas: 'connected' },
  });
}

interface CheckInternals {
  beUrl: string;
  dmChatId: string;
  bot: Bot;
  isFirstCheck: boolean;
  check(): Promise<void>;
}

const mockSent: string[][] = [];

describe('HealthMonitorService alerts', () => {
  let service: HealthMonitorService;
  let inner: CheckInternals;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    mockSent.length = 0;

    const config = {
      get: (key: string) =>
        ({
          TELEGRAM_BOT_TOKEN: 'token',
          TELEGRAM_DM_CHAT_ID: 'chat-1',
        })[key],
    } as unknown as ConfigService;

    service = new HealthMonitorService(config);
    inner = service as unknown as CheckInternals;
    // Drive checks manually — bypasses onModuleInit's interval + fire-and-
    // forget first check so tests are deterministic.
    inner.beUrl = 'https://api.example.test';
    inner.dmChatId = 'chat-1';
    inner.isFirstCheck = true;
    inner.bot = new Bot('token');

    fetchMock = jest.fn();
    jest.spyOn(global, 'fetch').mockImplementation(fetchMock as typeof fetch);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const respondWith = (impl: (url: string) => Promise<FetchResponse>): void => {
    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.href
            : input.url;
      return Promise.resolve(impl(url) as unknown as Response);
    });
  };

  it('reports the HTTP status when /health answers with an error', async () => {
    respondWith(() => Promise.resolve(jsonResponse(429, {})));
    await inner.check();
    expect(mockSent[0][0]).toContain('HTTP 429');
    expect(mockSent[0][0]).toContain('Backend is DOWN');
  });

  it('reports timeouts distinctly from error responses', async () => {
    respondWith(
      () =>
        new Promise((_resolve, reject) =>
          setTimeout(
            () => reject(new DOMException('timed out', 'TimeoutError')),
            0,
          ),
        ),
    );
    await inner.check();
    expect(mockSent[0][0]).toContain('no response');
  });

  it('flags DB checks whose /health/db endpoint is unreachable', async () => {
    respondWith((url) =>
      Promise.resolve(
        url.endsWith('/health/db')
          ? healthyDb()
          : jsonResponse(200, { ok: true }),
      ),
    );
    await inner.check();

    // Backend stays up, but /health/db stops answering.
    respondWith((url) =>
      Promise.resolve(
        url.endsWith('/health/db')
          ? jsonResponse(500, {})
          : jsonResponse(200, { ok: true }),
      ),
    );
    await inner.check();
    expect(mockSent[mockSent.length - 1].join('\n')).toContain(
      '/health/db unreachable',
    );
  });

  it('recovers with a back-online alert after a failed period', async () => {
    respondWith(() => Promise.resolve(jsonResponse(429, {})));
    await inner.check();
    expect(mockSent[0][0]).toContain('Backend is DOWN');

    respondWith((url) =>
      Promise.resolve(
        url.endsWith('/health/db')
          ? healthyDb()
          : jsonResponse(200, { ok: true }),
      ),
    );
    await inner.check();
    expect(mockSent[mockSent.length - 1][0]).toContain('back online');
  });
});
