---
name: debugging-wizard
description: Systematically debug issues with structured root-cause analysis. Use when investigating bugs, diagnosing errors, or troubleshooting unexpected behavior. Trigger on keywords like debug, bug, error, fix, issue, problem, troubleshoot.
---

# Debugging Wizard

## When to Use

- Investigating bugs
- Diagnosing errors
- Troubleshooting unexpected behavior
- Analyzing error logs
- Fixing race conditions

## Systematic Debugging Process

1. **Reproduce** — Can you reliably reproduce the issue?
2. **Isolate** — Where does the problem occur?
3. **Analyze** — What is the root cause?
4. **Fix** — What's the minimal fix?
5. **Verify** — Does the fix work? Any side effects?
6. **Document** — What did you learn?

## Common Issue Patterns

### API Errors

```typescript
// Symptom: 500 errors in production
// Check: Server logs, request/response bodies

// Debug approach
try {
  const result = await this.service.process(data);
  return result;
} catch (error) {
  console.error('Service error:', error);
  throw new HttpException('Internal error', HttpStatus.INTERNAL_SERVER_ERROR);
}
```

### State Bugs

```tsx
// Symptom: UI not updating
// Check: State management, render cycles

// Debug approach
useEffect(() => {
  console.log('State changed:', state);
}, [state]);
```

### Performance Issues

```typescript
// Symptom: Slow queries, high latency
// Check: Query execution plans, N+1 queries

// Debug approach
const start = Date.now();
const result = await this.model.find(query);
console.log(`Query took ${Date.now() - start}ms`);
```

### WebSocket Issues

```typescript
// Symptom: Messages not received
// Check: Connection state, event listeners

// Debug approach
socket.on('connect', () => console.log('Connected'));
socket.on('disconnect', (reason) => console.log('Disconnected:', reason));
socket.onAny((event, ...args) => console.log('Event:', event, args));
```

## Debugging Tools

### Console Methods
```typescript
console.log('Basic log');
console.warn('Warning');
console.error('Error');
console.table(data); // Tabular data
console.time('timer');
console.timeEnd('timer');
console.group('group');
console.groupEnd();
```

### Network Debugging
```typescript
// Check request/response
const response = await fetch(url);
console.log('Status:', response.status);
console.log('Headers:', response.headers);
const data = await response.json();
console.log('Data:', data);
```

### Database Debugging
```typescript
// Enable Mongoose debug
mongoose.set('debug', true);

// Log queries
const start = Date.now();
const result = await Model.find(query);
console.log(`Query: ${Model.modelName}.find() took ${Date.now() - start}ms`);
```

## Common Fixes

### Race Condition
```typescript
// Problem: Multiple updates causing inconsistent state
// Fix: Use mutex/lock

import { Mutex } from 'async-mutex';
const mutex = new Mutex();

async function updateGame(id: string, data: Partial<Game>) {
  const release = await mutex.acquire();
  try {
    const game = await this.gameModel.findById(id);
    Object.assign(game, data);
    await game.save();
    return game;
  } finally {
    release();
  }
}
```

### Memory Leak
```typescript
// Problem: Event listeners not cleaned up
// Fix: Cleanup in useEffect return

useEffect(() => {
  const handler = (event: MessageEvent) => {
    console.log(event.data);
  };
  window.addEventListener('message', handler);

  return () => {
    window.removeEventListener('message', handler);
  };
}, []);
```

### Stale Closure
```typescript
// Problem: State not updating in callback
// Fix: Use functional update or ref

// BAD
setCount(count + 1);

// GOOD
setCount(prev => prev + 1);

// GOOD (for complex state)
const countRef = useRef(count);
countRef.current = count;
```

## Debugging Checklist

- [ ] Can you reproduce the issue?
- [ ] Have you checked the error message?
- [ ] Have you looked at the network requests?
- [ ] Have you checked the database state?
- [ ] Have you reviewed recent changes?
- [ ] Have you tested in different environments?
- [ ] Have you checked for race conditions?
- [ ] Have you verified the fix doesn't break other features?

## Constraints

### MUST DO
- Reproduce before fixing
- Understand root cause
- Write tests for the fix
- Document what you learned
- Check for similar issues elsewhere

### DON'T
- Fix without understanding
- Apply band-aid solutions
- Skip testing the fix
- Ignore related issues
- Leave debug code in production
