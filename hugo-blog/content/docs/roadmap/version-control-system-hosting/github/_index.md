---
title: "Github"
description: "GitHub for data teams: pull requests, branch rulesets, CODEOWNERS, GitHub Actions for CI/CD, security features, and where Copilot and Codespaces fit."
weight: 1
---

# GitHub

**GitHub** is the largest Git hosting platform, owned by Microsoft since 2018. It hosts repositories and wraps them with pull requests, code review, issues, project boards, CI/CD (**GitHub Actions**), package and container registries, and security scanning. It is also the home of most open-source data tooling: Airflow, Spark, dbt, DuckDB, Trino and Iceberg all develop on GitHub, so knowing it well is part of contributing to and tracking that ecosystem.

## Features that matter for data teams

| Feature | What it does |
|---|---|
| **Pull requests** | Diff, review comments, suggested changes, required approvals. See the [PR flow]({{< relref "/docs/roadmap/version-control-system-hosting" >}}). |
| **Rulesets / branch protection** | Block direct pushes to `main`, require passing checks, reviews, linear history or signed commits |
| **CODEOWNERS** | A file mapping paths to teams, e.g. `models/finance/ @acme/finance-data`, who are auto-requested as reviewers |
| **GitHub Actions** | CI/CD defined in `.github/workflows/*.yml`, triggered by pushes, PRs, schedules or manual runs |
| **Merge queue** | Tests each PR combined with the ones ahead of it before merging, so `main` never breaks on a busy repo |
| **Environments** | Deployment targets (`staging`, `prod`) with required reviewers and their own secrets |
| **GHCR** | Container registry at `ghcr.io` for the images your pipelines run |
| **Security** | Dependabot updates, secret scanning with push protection, CodeQL code scanning |
| **Codespaces** | Cloud dev environments from a `devcontainer.json`, handy for onboarding |
| **Copilot** | AI assistance in the editor and for PR summaries and reviews |

## GitHub Actions in one example

```yaml
name: deploy-dags
on:
  push:
    branches: [main]
permissions:
  id-token: write      # OIDC: short-lived cloud credentials, no stored keys
  contents: read
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: prod   # waits for an approval if the environment requires one
    steps:
      - uses: actions/checkout@v5
      - uses: aws-actions/configure-aws-credentials@v4
        with: { role-to-assume: arn:aws:iam::123456789012:role/dag-deployer, aws-region: eu-central-1 }
      - run: aws s3 sync dags/ s3://acme-airflow/dags/ --delete
```

Workflows are built from reusable **actions** published in the Marketplace. Pin third-party actions to a full commit SHA: a compromised tag can run arbitrary code with your secrets.

## The `gh` CLI

```bash
gh repo clone acme/data-platform
gh pr create --fill --reviewer acme/data-eng
gh pr checks            # watch CI on your PR
gh pr merge --squash --delete-branch
gh run watch            # follow an Actions run
```

## Common mistakes

- **Long-lived cloud keys as repository secrets.** Use OIDC federation so each run gets short-lived credentials.
- **Workflows triggered by `pull_request_target` that check out PR code.** This runs untrusted fork code with your secrets. Read GitHub's security hardening guide before using it.
- **Admins bypassing protection.** Keep administrators off the ruleset bypass list so "just this once" pushes to `main` do not happen.
- **Giant monorepo checks on every PR.** Use path filters so the dbt checks run only when `models/` changes.

## Learning Resources

- [GitHub Docs](https://docs.github.com/en)
- [GitHub Skills](https://skills.github.com/): free interactive courses (replaced the old Learning Lab)
- [GitHub Actions documentation](https://docs.github.com/en/actions) and [security hardening for Actions](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions)
- [About rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- [GitHub CLI manual](https://cli.github.com/manual/)
