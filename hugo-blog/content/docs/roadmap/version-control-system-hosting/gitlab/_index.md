---
title: "Gitlab"
description: "GitLab explained: one platform for Git hosting, merge requests and built-in CI/CD, the self-managed option, .gitlab-ci.yml pipelines, runners and scanning."
weight: 2
---

# GitLab

**GitLab** is a Git hosting platform built as a single application for the whole software lifecycle: repositories, **merge requests**, issues, **GitLab CI/CD**, container and package registries, security scanning and deployment environments. It is available as a SaaS (**GitLab.com**) or **self-managed** on your own servers, which is why it is popular with companies that must keep code on-premises: banks, governments, and teams in regions where cloud SaaS is restricted.

## Editions

| Edition | License | Notes |
|---|---|---|
| **Community Edition (CE)** | Open source (MIT) | Free, self-managed, core Git + CI/CD |
| **Free / Premium / Ultimate** | Proprietary tiers (Enterprise Edition) | Adds approvals rules, advanced CI, security dashboards, compliance; available on GitLab.com and self-managed |
| **GitLab Dedicated** | Single-tenant SaaS | For regulated organizations |

## GitLab CI/CD

Pipelines live in `.gitlab-ci.yml` at the repository root. Jobs are grouped into **stages**; jobs in the same stage run in parallel, and stages run in order. Jobs execute on **runners**: GitLab-hosted ones, or your own installed on VMs or Kubernetes, close to your data.

```yaml
stages: [lint, test, deploy]

default:
  image: python:3.12-slim

lint:
  stage: lint
  script: [pip install sqlfluff, sqlfluff lint models/]

dbt-test:
  stage: test
  script: [pip install dbt-postgres, dbt build --target ci]
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"

deploy-prod:
  stage: deploy
  script: [./deploy.sh]
  environment: production
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
      when: manual          # continuous delivery: a human presses the button
```

Useful features: `needs:` to build a DAG of jobs instead of strict stages, **parent-child and multi-project pipelines**, **CI/CD components** for reusable templates, and **merge trains** that test merge requests in sequence before merging.

## GitLab vs GitHub

| | GitLab | GitHub |
|---|---|---|
| Philosophy | One integrated DevOps product | Core platform plus a large marketplace |
| Self-hosting | First-class, free CE | GitHub Enterprise Server (paid) |
| CI config | One `.gitlab-ci.yml` | Many workflow files, reusable actions |
| Community | Strong in enterprises and self-hosters | Largest open-source community |

## Common mistakes

- **Shared runners for production deploys.** Use dedicated, tagged runners with only the permissions that environment needs.
- **Unprotected CI/CD variables.** Mark secrets as **protected** and **masked** so they are only exposed to pipelines on protected branches.
- **Duplicated YAML across repos.** Use `include:` and CI/CD components instead of copying pipelines.

## Learning Resources

- [GitLab documentation](https://docs.gitlab.com/)
- [Get started with GitLab CI/CD](https://docs.gitlab.com/ci/)
- [`.gitlab-ci.yml` keyword reference](https://docs.gitlab.com/ci/yaml/)
- [GitLab CI/CD Tutorial for Beginners, TechWorld with Nana](https://www.youtube.com/watch?v=qP8kir2GUgo)
- See also: [CI/CD]({{< relref "../../cicd" >}})
