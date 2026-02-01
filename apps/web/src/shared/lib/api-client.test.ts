import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { apiClient } from './api-client';

// Mock global fetch
global.fetch = vi.fn();

describe('apiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('performs basic GET request successfully', async () => {
    const mockData = { id: 1, name: 'Test' };
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockData,
    });

    const data = await apiClient.get('/test');

    expect(data).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('performs POST request with data', async () => {
    const payload = { title: 'New Post' };
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ ...payload, id: 101 }),
    });

    const data = await apiClient.post('/create', payload);

    expect(data).toMatchObject(payload);
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    );
  });

  it('includes Authorization header if token is provided', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    await apiClient.get('/secure', { token: 'secret-token' });

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer secret-token',
        }),
      }),
    );
  });

  it('handles 204 No Content', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: async () => {
        throw new Error('No content');
      },
    });

    const data = await apiClient.get('/nocontent');
    expect(data).toEqual({});
  });

  it('handles JSON parse error for 200 responses', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => {
        throw new Error('Parse error');
      },
    });

    const data = await apiClient.get('/badjson');
    expect(data).toEqual({});
  });

  it('includes custom headers', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    await apiClient.get('/test', { headers: { 'X-Custom': 'Value' } });
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-Custom': 'Value',
        }),
      }),
    );
  });

  it('parses error message from JSON body', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Specific server error' }),
    });

    try {
      await apiClient.get('/error');
    } catch (e: unknown) {
      const err = e as { message: string; status: number; data: unknown };
      expect(err.message).toBe('Specific server error');
      expect(err.status).toBe(400);
      expect(err.data).toEqual({ message: 'Specific server error' });
    }
  });

  it('uses default error message if JSON body has no message property', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ code: 'INTERNAL_ERROR' }),
    });

    try {
      await apiClient.get('/error');
    } catch (e: unknown) {
      const err = e as { message: string; data: unknown };
      expect(err.message).toBe('An error occurred while fetching data.');
      expect(err.data).toEqual({ code: 'INTERNAL_ERROR' });
    }
  });

  it('handles non-JSON error responses', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: false,
      status: 502,
      json: async () => {
        throw new Error('Not JSON');
      },
    });

    try {
      await apiClient.get('/error');
    } catch (e: unknown) {
      const err = e as { message: string; status: number };
      expect(err.message).toBe('An error occurred while fetching data.');
      expect(err.status).toBe(502);
    }
  });

  it('supports all HTTP methods', async () => {
    (fetch as Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    await apiClient.put('/update', { foo: 'bar' });
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: 'PUT' }),
    );

    await apiClient.delete('/remove');
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
});
