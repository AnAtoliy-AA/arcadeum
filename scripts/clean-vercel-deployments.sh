#!/usr/bin/env python3
"""Delete all Vercel deployments except the latest one per protected branch
(main, staging, develop) and the latest production deployment.

Usage:
    python3 scripts/clean-vercel-deployments.sh                     # single project (auto-detect)
    python3 scripts/clean-vercel-deployments.sh --all               # all projects in team
    python3 scripts/clean-vercel-deployments.sh --project arcadeum  # specific project
    python3 scripts/clean-vercel-deployments.sh --dry-run           # preview only

Environment:
    VERCEL_TOKEN       API token (auto-detected from ~/.config/com.vercel.cli/ if unset)
    VERCEL_PROJECT_ID  Project ID override
    VERCEL_TEAM_ID     Team ID override (auto-detected from token)
"""

import argparse
import json
import os
import re
import sys
import time
import urllib.request
import urllib.error
import concurrent.futures

MAX_RETRIES = 3
BRANCHES = {"main", "staging", "develop"}


class VercelAPI:
    def __init__(self, token, team_id=None):
        self.token = token
        self.team_id = team_id

    def _url(self, path):
        url = f"https://api.vercel.com{path}"
        if self.team_id:
            sep = "&" if "?" in url else "?"
            url += f"{sep}teamId={self.team_id}"
        return url

    def get(self, path):
        return self._request("GET", path)

    def delete(self, path):
        return self._request("DELETE", path)

    def _request(self, method, path):
        for attempt in range(MAX_RETRIES):
            try:
                req = urllib.request.Request(
                    self._url(path),
                    headers={"Authorization": f"Bearer {self.token}"},
                    method=method,
                )
                resp = urllib.request.urlopen(req, timeout=15)
                body = resp.read()
                return json.loads(body) if body else {}
            except urllib.error.HTTPError as e:
                if e.code == 429:
                    wait = 2 ** (attempt + 1)
                    print(f"    Rate limited, waiting {wait}s...")
                    time.sleep(wait)
                    continue
                raise
        return {}


def detect_token():
    for path in [
        os.path.expanduser("~/Library/Application Support/com.vercel.cli/auth.json"),
        os.path.expanduser("~/.vercel/auth.json"),
        os.path.expanduser("~/.config/vercel/auth.json"),
    ]:
        if os.path.exists(path):
            with open(path) as f:
                token = json.load(f).get("token", "")
                if token:
                    return token
    return None


def detect_team(api):
    resp = api.get("/v2/teams")
    teams = resp.get("teams", [])
    if teams:
        return teams[0]["id"]
    return None


def fetch_all(api, project_id):
    all_d = []
    while True:
        path = f"/v6/deployments?projectId={project_id}&limit=100"
        if all_d:
            path += f"&until={all_d[-1].get('created', 0)}"
        batch = api.get(path).get("deployments", [])
        if not batch:
            break
        all_d.extend(batch)
        if len(batch) < 100:
            break
    return all_d


def detect_branch_pattern(api, uid):
    """Auto-detect the branch alias pattern from a deployment's aliases."""
    try:
        resp = api.get(f"/v6/deployments/{uid}/aliases")
        for a in resp.get("aliases", []):
            alias = a.get("alias", "")
            # Match: {project}-git-{branch}-{team}.vercel.app
            m = re.match(r"^(.+)-git-(.+)-([^.]+)\.vercel\.app$", alias)
            if m:
                return m.group(2)  # the branch part
    except:
        pass
    return None


def detect_branch(api, uid, branch_pattern_cache):
    """Get branch name from aliases using cached pattern."""
    try:
        resp = api.get(f"/v6/deployments/{uid}/aliases")
        for a in resp.get("aliases", []):
            alias = a.get("alias", "")
            # Try known patterns
            for pattern_name, regex in [
                ("dashed", re.compile(r"^(.+)-git-(.+)-([^.]+)\.vercel\.app$")),
                ("slashed", re.compile(r"^(.+)-git-([^-]+)-([^.]+)\.vercel\.app$")),
            ]:
                m = regex.match(alias)
                if m:
                    branch = m.group(2)
                    # Multi-word branches use dashes in alias, restore slashes
                    branch = branch.replace("-", "/") if "/" in branch_pattern_cache.get(uid, "") else branch
                    return branch
    except:
        pass
    return None


def classify_deployments(api, all_d):
    """Classify deployments into keep/delete lists using alias-based branch detection."""
    latest_prod = None
    latest_by_branch = {}
    to_delete = []
    unknown = []

    # First pass: fast classification for production
    for d in all_d:
        uid = d["uid"]
        target = d.get("target", "")
        created = d.get("created", 0)

        if target == "production":
            if latest_prod is None or created > latest_prod[1]:
                if latest_prod:
                    to_delete.append(latest_prod[0])
                latest_prod = (uid, created)
            else:
                to_delete.append(uid)
            continue

        unknown.append(d)

    if not unknown:
        return latest_prod, latest_by_branch, to_delete

    # Second pass: check aliases for branch info (parallel)
    print(f"  Checking {len(unknown)} preview deployments for branch info...")
    branch_results = {}

    def check_branch(d):
        uid = d["uid"]
        try:
            resp = api.get(f"/v6/deployments/{uid}/aliases")
            for a in resp.get("aliases", []):
                alias = a.get("alias", "")
                # Pattern: {project}-git-{branch}-{team}.vercel.app
                m = re.match(r"^(.+)-git-(.+)-([^.]+)\.vercel\.app$", alias)
                if m:
                    return uid, m.group(2)
        except:
            pass
        return uid, None

    with concurrent.futures.ThreadPoolExecutor(max_workers=15) as pool:
        futures = {pool.submit(check_branch, d): d for d in unknown}
        for f in concurrent.futures.as_completed(futures):
            uid, branch = f.result()
            if branch:
                branch_results[uid] = branch

    # Classify based on branch
    for d in unknown:
        uid = d["uid"]
        created = d.get("created", 0)
        branch = branch_results.get(uid)

        if branch in BRANCHES:
            if branch not in latest_by_branch or created > latest_by_branch[branch][1]:
                if branch in latest_by_branch:
                    to_delete.append(latest_by_branch[branch][0])
                latest_by_branch[branch] = (uid, created)
            else:
                to_delete.append(uid)
        else:
            to_delete.append(uid)

    return latest_prod, latest_by_branch, to_delete


def delete_deployments(api, to_delete, dry_run=False):
    if dry_run:
        print(f"  [DRY RUN] Would delete {len(to_delete)} deployments")
        return len(to_delete), 0

    deleted = failed = 0
    for i, uid in enumerate(to_delete):
        for attempt in range(MAX_RETRIES):
            try:
                api.delete(f"/v13/deployments/{uid}")
                deleted += 1
                break
            except urllib.error.HTTPError as e:
                if e.code == 429:
                    time.sleep(2 ** (attempt + 1))
                else:
                    failed += 1
                    break
            except:
                failed += 1
                break

        if (i + 1) % 10 == 0 or i + 1 == len(to_delete):
            pct = (i + 1) * 100 // len(to_delete)
            print(f"  [{pct}%] {i + 1}/{len(to_delete)} deleted={deleted} failed={failed}")
        time.sleep(0.15)

    return deleted, failed


def clean_project(api, project_id, project_name, dry_run=False):
    print(f"\n{'='*50}")
    print(f"Project: {project_name} ({project_id})")
    print(f"{'='*50}")

    all_d = fetch_all(api, project_id)
    print(f"  Total deployments: {len(all_d)}")

    if not all_d:
        print("  Nothing to clean.")
        return 0, 0

    latest_prod, latest_by_branch, to_delete = classify_deployments(api, all_d)

    keep_uids = set()
    if latest_prod:
        keep_uids.add(latest_prod[0])
    for uid, _ in latest_by_branch.values():
        keep_uids.add(uid)

    print(f"\n  KEEPING ({len(keep_uids)}):")
    if latest_prod:
        print(f"    production: {latest_prod[0]}")
    for branch, (uid, _) in sorted(latest_by_branch.items()):
        print(f"    {branch}: {uid}")

    print(f"  TO DELETE: {len(to_delete)}")

    deleted, failed = delete_deployments(api, to_delete, dry_run)
    return deleted, failed


def main():
    parser = argparse.ArgumentParser(description="Clean old Vercel deployments")
    parser.add_argument("--all", action="store_true", help="Clean all projects in the team")
    parser.add_argument("--project", type=str, help="Clean a specific project by name")
    parser.add_argument("--dry-run", action="store_true", help="Preview only, don't delete")
    parser.add_argument("--token", type=str, help="Vercel API token")
    parser.add_argument("--team", type=str, help="Team ID")
    args = parser.parse_args()

    token = args.token or os.environ.get("VERCEL_TOKEN") or detect_token()
    if not token:
        sys.exit("No token. Set VERCEL_TOKEN or pass --token")

    team_id = args.team or os.environ.get("VERCEL_TEAM_ID")
    api = VercelAPI(token, team_id)

    # Auto-detect team if not provided
    if not team_id:
        team_id = detect_team(api)
        if team_id:
            api.team_id = team_id
            print(f"Detected team: {team_id}")

    # Get all projects
    projects_resp = api.get("/v9/projects")
    all_projects = projects_resp.get("projects", [])

    if not all_projects:
        sys.exit("No projects found")

    # Filter projects
    if args.project:
        projects = [p for p in all_projects if p["name"] == args.project]
        if not projects:
            sys.exit(f"Project '{args.project}' not found. Available: {', '.join(p['name'] for p in all_projects)}")
    elif not args.all:
        projects = all_projects[:1]  # default: first project only
    else:
        projects = all_projects

    print(f"Projects to clean: {', '.join(p['name'] for p in projects)}")
    if args.dry_run:
        print("MODE: DRY RUN (no deletions)")

    total_deleted = total_failed = 0
    for p in projects:
        deleted, failed = clean_project(api, p["id"], p["name"], args.dry_run)
        total_deleted += deleted
        total_failed += failed

    print(f"\n{'='*50}")
    print(f"TOTAL: deleted {total_deleted}, failed {total_failed}")
    print(f"Kept: latest production + latest per branch (main, staging, develop)")


if __name__ == "__main__":
    main()
