# 🚀 Release Checklist

Use this checklist before cutting a new release.  
Follow the order. Do not skip steps.

---

## ✅ Pre-Release Preparation

- [ ] All features/fixes are merged into `main` branch
- [ ] All PRs have been reviewed and approved
- [ ] All tests pass in CI (`lint`, `test-unit`, `test-e2e-be`, `web-e2e`)
- [ ] No `N/A` or vague changelog entries remain — all entries are human-readable and follow format:
  > _"[Action] [What] [for whom / why] ([Ticket])"_
- [ ] Commit messages follow [Conventional Commits](https://www.conventionalcommits.org):
  - `feat: ... (ARC-XXX)`
  - `fix: ... (ARC-XXX)`
  - `docs: ... (ARC-XXX)`
  - `chore: ...` (for tooling)
- [ ] `CHANGELOG.md` is up to date and clean (run `pnpm changelog` if needed)

---

## ✅ Cut the Release

1. **Pull latest changes:**

   ```bash
   git checkout main
   git pull origin main
   ```

2. **Run release script:**

   ```bash
   pnpm release
   ```

   - This will:
     - Bump version in `package.json`
     - Auto-generate changelog using `pnpm changelog`
     - Create a git tag (e.g., `v1.8.1`)
     - Commit and push `package.json` and `CHANGELOG.md`

3. **Verify the tag was created:**

   ```bash
   git tag --list | tail -n 1
   ```

4. **Push the tag:**

   ```bash
   git push origin main --tags
   ```

5. **Confirm GitHub Actions ran:**
   - Go to [Actions tab](https://github.com/your-org/arcadeum/actions)
   - Ensure `Release` workflow ran successfully
   - Confirm `CHANGELOG.md` was updated in `main`

---

## ✅ Post-Release

- [ ] Notify team via Slack/Teams:
  > “🚀 Released v1.8.1! Changelog: https://github.com/your-org/arcadeum/blob/main/CHANGELOG.md”
- [ ] Update relevant documentation (e.g., release notes, internal wiki)
- [ ] Close all GitHub issues tied to this release
- [ ] If this is a **major** release (`v2.x.x`), notify stakeholders and update marketing materials

---

## 🛠️ Troubleshooting

| Issue                                    | Fix                                                                  |
| ---------------------------------------- | -------------------------------------------------------------------- |
| `standard-version` fails to bump version | Check commit messages — must start with `feat:`, `fix:`, etc.        |
| Changelog not updating                   | Run `pnpm changelog` manually before `pnpm release`                  |
| Tag not pushed                           | Run `git push origin main --tags` manually                           |
| CI fails on release                      | Ensure `release.yml` workflow is enabled and `fetch-depth: 0` is set |

---

> 💡 **Pro Tip**: Always use `pnpm release` — never manually edit `package.json` or `CHANGELOG.md` for versioning.
