import { extractClientIp } from './client-ip.util';
import type { Request } from 'express';

function makeReq(headers: Record<string, unknown>, ip?: string): Request {
  return {
    headers,
    ip,
    socket: { remoteAddress: ip ? undefined : '10.0.0.1' },
  } as unknown as Request;
}

describe('extractClientIp', () => {
  it('returns req.ip by default and ignores CF-Connecting-IP', () => {
    const req = makeReq({ 'cf-connecting-ip': '9.9.9.9' }, '1.2.3.4');
    expect(extractClientIp(req)).toBe('1.2.3.4');
  });

  it('ignores CF-Connecting-IP even when req.ip is missing', () => {
    const req = makeReq({ 'cf-connecting-ip': '9.9.9.9' });
    expect(extractClientIp(req)).toBe('10.0.0.1');
  });

  it('trusts CF-Connecting-IP when trustCloudflare is enabled', () => {
    const req = makeReq({ 'cf-connecting-ip': '9.9.9.9' }, '1.2.3.4');
    expect(extractClientIp(req, { trustCloudflare: true })).toBe('9.9.9.9');
  });

  it('falls back to req.ip when trusted CF header is absent', () => {
    const req = makeReq({}, '1.2.3.4');
    expect(extractClientIp(req, { trustCloudflare: true })).toBe('1.2.3.4');
  });

  it('ignores blank CF-Connecting-IP values', () => {
    const req = makeReq({ 'cf-connecting-ip': '   ' }, '1.2.3.4');
    expect(extractClientIp(req, { trustCloudflare: true })).toBe('1.2.3.4');
  });
});
