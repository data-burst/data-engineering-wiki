---
title: "BitBucket"
description: "Bitbucket explained: Atlassian's Git host with Jira integration, Bitbucket Pipelines CI/CD, Cloud vs Data Center, and how it compares with GitHub and GitLab."
weight: 3
---

# Bitbucket

**Bitbucket** is Atlassian's Git hosting platform. It offers repositories, pull requests, branch permissions and built-in CI/CD (**Bitbucket Pipelines**), and its main draw is deep integration with **Jira** and **Confluence**: branches, commits, PRs and deployments show up directly on Jira issues. Teams that already run on Atlassian tools often pick it for that reason.

## Facts to get right

- **Git only.** Bitbucket used to host Mercurial repositories too, but **dropped Mercurial support in 2020**. Older articles that list Mercurial as a Bitbucket advantage are outdated.
- **Cloud vs Data Center.** **Bitbucket Cloud** is the SaaS at bitbucket.org. The self-hosted **Bitbucket Server** product reached end of support in February 2024; self-hosted customers use **Bitbucket Data Center**.
- **Free tier.** Bitbucket Cloud's free plan includes private repositories for small teams (up to 5 users) with a monthly allowance of Pipelines build minutes.

## Key features

| Feature | What it does |
|---|---|
| Pull requests | Review, inline comments, tasks, required approvals and merge checks |
| Branch permissions | Restrict who can push or merge to `main` and release branches |
| Bitbucket Pipelines | CI/CD defined in `bitbucket-pipelines.yml`, running in Docker containers |
| Deployments | Track what is deployed to test, staging and production environments |
| Jira integration | Reference `DATA-142` in a branch or commit and it links to the issue automatically |

```yaml
# bitbucket-pipelines.yml
image: python:3.12-slim
pipelines:
  pull-requests:
    '**':
      - step:
          name: Lint and test
          script:
            - pip install -r requirements.txt
            - ruff check . && pytest
  branches:
    main:
      - step:
          name: Deploy DAGs
          deployment: production
          trigger: manual
          script:
            - ./deploy.sh
```

## When to choose it

Choose Bitbucket when your organization standardizes on Jira and Confluence and wants code, issues and docs linked with minimal setup. Choose [GitHub]({{< relref "../github" >}}) for the broadest ecosystem and open-source work, or [GitLab]({{< relref "../gitlab" >}}) for a free self-hosted all-in-one platform.

## Learning Resources

- [Bitbucket Cloud documentation](https://support.atlassian.com/bitbucket-cloud/)
- [Bitbucket Pipelines documentation](https://support.atlassian.com/bitbucket-cloud/docs/get-started-with-bitbucket-pipelines/)
- [Learn Git with Bitbucket Cloud (Atlassian tutorial)](https://www.atlassian.com/git/tutorials/learn-git-with-bitbucket-cloud)
- [Atlassian Git tutorials](https://www.atlassian.com/git/tutorials): excellent free guides on merging, rebasing and workflows
