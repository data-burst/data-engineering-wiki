---
title: "Version Control System"
description: "Why data engineers version everything (pipelines, SQL, infrastructure, schemas) and how a version control system like Git records, branches and merges changes."
bookCollapseSection: true
weight: 7
---

# Version Control System

A **version control system (VCS)** records every change to a set of files: who changed what, when and why. You can see the full history, compare any two versions, undo a bad change, and let many people work on the same code in parallel without overwriting each other.

For data engineers, "code" covers far more than application source: Airflow DAGs, dbt models and SQL, Spark jobs, Terraform, Kubernetes manifests, schema definitions and data contracts. If it is not in version control, it cannot be reviewed, tested in [CI/CD]({{< relref "../cicd" >}}) or rebuilt after a disaster.

## Centralized vs distributed

| | Centralized (Subversion, Perforce) | Distributed (Git, Mercurial) |
|---|---|---|
| Where history lives | One central server | Every clone has the full history |
| Working offline | Limited | Commit, branch and diff offline |
| Branching | Heavier, often avoided | Cheap and central to the workflow |
| Typical use today | Large binary assets (games), legacy | Almost all software and data projects |

**Git** won: it is the standard for practically all new projects, and every major hosting platform is built around it.

## What is in this section

- [Git]({{< relref "git" >}}): commits, branches, merge vs rebase (animated), and workflows for data repositories.

Hosting, code review and pull requests are covered in [Version Control System Hosting]({{< relref "../version-control-system-hosting" >}}).

## What not to put in Git

- **Data.** Large datasets, Parquet files and database dumps bloat the repository forever. Keep data in object storage; version it with table formats (Iceberg, Delta time travel) or tools like lakeFS or DVC.
- **Secrets.** Passwords and keys in history stay there even after you delete the file. Use a secrets manager and a pre-commit secret scanner.
- **Generated files.** Build output, `target/` folders and compiled manifests belong in `.gitignore`.

## Learning Resources

- [Pro Git, Scott Chacon and Ben Straub (free online)](https://git-scm.com/book/en/v2): chapter 1 covers version control basics
- [About version control (Pro Git)](https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control)
