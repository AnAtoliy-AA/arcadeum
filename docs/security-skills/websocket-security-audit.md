# WebSocket Security Audit (Socket.io)

Based on MITRE ATT&CK T1190, T1552.001 and OWASP API Security Top 10.

## When to Use

- After implementing or modifying Socket.io handlers
- Before deployment to production
- When investigating real-time communication vulnerabilities

## Attacks to Test

### 1. Missing Authentication on WebSocket Upgrade

```python
import asyncio
import websockets
import json

# Test connecting without authentication
async def test_no_auth():
    try:
        async with websockets.connect("wss://target.com/socket.io/") as ws:
            await ws.send(json.dumps({"type": "get_user_data"}))
            resp = await asyncio.wait_for(ws.recv(), timeout=5)
            print(f"[VULN] Accessible without auth: {resp[:200]}")
    except Exception as e:
        print(f"[SECURE] Rejected: {e}")

asyncio.run(test_no_auth())
```

### 2. Cross-Site WebSocket Hijacking (CSWSH)

Test if server validates Origin header:

```python
origins = [
    None,
    "https://evil.com",
    "https://target.com.evil.com",
    "null",
]

for origin in origins:
    headers = {"Authorization": "Bearer <token>"}
    if origin:
        headers["Origin"] = origin
    # Test if connection succeeds with each origin
```

### 3. Message Injection

Test for injection via WebSocket messages:

```json
{"type": "search", "query": "' OR '1'='1"}
{"type": "search", "query": {"$ne": ""}}
{"type": "send_message", "content": "<script>alert(1)</script>"}
```

### 4. Denial of Service

- [ ] Rate limiting on message volume per connection
- [ ] Maximum message size enforced
- [ ] Maximum connections per client enforced

## Checklist

### Authentication & Authorization

- [ ] WebSocket connections require authentication (token in header, not query string)
- [ ] Invalid/expired tokens rejected at handshake
- [ ] Per-message authorization checks (not just connection-level)
- [ ] Reconnection re-validates authentication

### Origin Validation

- [ ] Origin header validated against allowlist
- [ ] Connections from unauthorized origins rejected
- [ ] CSRF token in WebSocket handshake URL

### Input Validation

- [ ] Message payload schema validated
- [ ] SQL/NoSQL injection prevented in message handlers
- [ ] XSS prevented in message rendering
- [ ] Maximum message size enforced

### DoS Protection

- [ ] Rate limiting per connection
- [ ] Rate limiting per user
- [ ] Connection limits enforced
- [ ] Large message payloads rejected

## Quick Scan

```bash
# Check Socket.io configuration
grep -rn "socket\|Socket\|gateway" apps/be/src/ --include="*.ts" | head -20

# Check for origin validation
grep -rn "origin\|Origin\|cors" apps/be/src/ --include="*.ts" | grep -i socket

# Check for authentication on WS handlers
grep -rn "@SubscribeMessage\|handleConnection" apps/be/src/ --include="*.ts" -A5
```

## References

- Source: Anthropic-Cybersecurity-Skills `testing-websocket-api-security`
- OWASP: https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/12-API_Testing/
