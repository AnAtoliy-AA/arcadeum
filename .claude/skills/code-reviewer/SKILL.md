---
name: code-reviewer
description: Review code for quality, best practices, and potential issues. Use when reviewing PRs, checking code standards, or providing feedback on implementations. Trigger on keywords like code review, PR review, best practices, code quality.
---

# Code Reviewer

## When to Use

- Reviewing pull requests
- Checking code standards
- Providing feedback on implementations
- Identifying potential issues
- Ensuring consistency

## Review Checklist

### Code Quality
- [ ] No `any` types
- [ ] Proper error handling
- [ ] Meaningful variable/function names
- [ ] No dead code
- [ ] DRY (Don't Repeat Yourself)

### Security
- [ ] Input validation
- [ ] No hardcoded secrets
- [ ] Proper authentication/authorization
- [ ] SQL/NoSQL injection prevention
- [ ] XSS prevention

### Performance
- [ ] No unnecessary re-renders
- [ ] Proper memoization
- [ ] Efficient data structures
- [ ] No memory leaks
- [ ] Lazy loading where appropriate

### Testing
- [ ] Unit tests for new code
- [ ] Edge cases covered
- [ ] Error states tested
- [ ] Integration tests for APIs

### Documentation
- [ ] Complex logic documented
- [ ] API endpoints documented
- [ ] Type definitions complete
- [ ] README updated if needed

## Review Output Format

### For Issues
```
**File**: path/to/file.ts:42
**Severity**: Critical | High | Medium | Low | Info
**Category**: Security | Performance | Bug | Style
**Description**: What's wrong
**Suggestion**: How to fix
```

### For Approvals
- LGTM (Looks Good To Me)
- Minor suggestions (non-blocking)
- Praise for good patterns

## Common Issues to Flag

### TypeScript
```typescript
// BAD
const data: any = fetchData();
function process(item: any) { }

// GOOD
const data: ApiResponse = fetchData();
function process(item: GameMove) { }
```

### React
```tsx
// BAD - unnecessary re-renders
function Parent() {
  return <Child onClick={() => console.log('clicked')} />;
}

// GOOD - stable reference
function Parent() {
  const handleClick = useCallback(() => console.log('clicked'), []);
  return <Child onClick={handleClick} />;
}
```

### NestJS
```typescript
// BAD - no validation
@Post()
create(@Body() data: any) {
  return this.service.create(data);
}

// GOOD - validated DTO
@Post()
create(@Body() createDto: CreateGameDto) {
  return this.service.create(createDto);
}
```

## Review Principles

1. **Be constructive** — Suggest solutions, not just problems
2. **Prioritize** — Focus on critical issues first
3. **Be specific** — Reference exact lines and provide examples
4. **Ask questions** — Understand the reasoning before criticizing
5. **Praise good work** — Acknowledge improvements and good patterns

## Constraints

### MUST DO
- Review all changes in the PR
- Check for security vulnerabilities
- Verify tests exist for new code
- Ensure consistent code style
- Provide actionable feedback

### MUST NOT DO
- Be rude or dismissive
- Skip reviewing test files
- Approve without thorough review
- Nitpick on trivial issues
- Ignore security concerns
