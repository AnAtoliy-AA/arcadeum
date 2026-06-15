---
name: commit
description: Create a git commit following the project's Conventional Commits convention with ARC ticket reference. Use when committing changes.
---

When creating a commit:

1. Run `git status` and `git diff --staged` to understand what's being committed
2. Determine the type: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`
3. Determine the scope from the current branch (e.g. `ARC-425` → scope is the affected area like `web`, `be`, `mobile`)
4. Write the commit message:

```
<type>(ARC-XXX): <short description>
```

- Subject: lowercase, no period at end, imperative mood ("add" not "added")
- Keep header under 72 characters
- Add body if needed to explain *why*, not *what*

5. Stage relevant files and commit:

```bash
git add <specific files>
git commit -m "<type>(ARC-XXX): <description>"
```

Do NOT use `git add -A` or `git add .` — stage specific files to avoid committing secrets or unrelated changes.
