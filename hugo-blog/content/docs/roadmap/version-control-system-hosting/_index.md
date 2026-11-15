---
title: "Version Control System Hosting"
description: "What Git hosting platforms add on top of Git: pull requests, code review, branch protection and CI. An animated PR flow plus GitHub, GitLab and Bitbucket."
bookCollapseSection: true
weight: 8
bookToC: false
---
<div class="lx-kicker-line">$ git push -u origin feat/dedupe-orders</div>

# Version Control System Hosting

A **Git hosting platform** stores the shared copy of your [Git]({{< relref "../version-control-system/git" >}}) repositories and adds everything a team needs around them: **pull requests** for code review, **branch protection**, **CI/CD**, issue tracking, permissions and audit logs. Git itself has none of these; the platform is where collaboration happens.

## The pull request flow

A **pull request** (PR; GitLab calls it a **merge request**, MR) is a proposal to merge one branch into another. It shows the diff, runs automated checks and collects reviews before anything reaches `main`.

{{< fig kicker="$ gh pr create --fill" title="From branch to main through a pull request" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 300">
<text x="30" y="30" class="m" font-size="11" font-weight="400" fill="#5C5869">main · protected: needs passing checks + 1 approval</text>
<line x1="60" y1="64" x2="200" y2="64" stroke="#3D3A49" stroke-width="1.6"/><circle cx="60" cy="64" r="14" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="60" y="68" text-anchor="middle" class="m" font-size="11" font-weight="700" fill="#17151F">a1</text><circle cx="130" cy="64" r="14" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="130" y="68" text-anchor="middle" class="m" font-size="11" font-weight="700" fill="#17151F">b2</text><circle cx="200" cy="64" r="14" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="200" y="68" text-anchor="middle" class="m" font-size="11" font-weight="700" fill="#17151F">c3</text>
<g class="f" data-step="1"><line x1="211" y1="73" x2="259" y2="111" stroke="#531A8A" stroke-width="1.6"/><line x1="270" y1="120" x2="340" y2="120" stroke="#531A8A" stroke-width="1.6"/><circle cx="270" cy="120" r="14" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text x="270" y="124" text-anchor="middle" class="m" font-size="11" font-weight="700" fill="#17151F">d4</text><circle cx="340" cy="120" r="14" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text x="340" y="124" text-anchor="middle" class="m" font-size="11" font-weight="700" fill="#17151F">e5</text><text x="254" y="154" class="m" font-size="11" font-weight="400" fill="#531A8A">feat/dedupe-orders</text></g>
<g class="f" data-step="2"><rect x="20" y="170" width="720" height="118" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="36" y="194" class="m" font-size="12" font-weight="700" fill="#17151F">PR #128  Deduplicate orders on order_id</text><text x="36" y="212" class="m" font-size="11" font-weight="400" fill="#5C5869">feat/dedupe-orders → main · 2 commits · +38 −4</text></g>
<g class="f" data-step="3"><text x="36" y="238" class="m" font-size="11" font-weight="400" fill="#531A8A">lint ........ PASS</text><text x="36" y="256" class="m" font-size="11" font-weight="400" fill="#531A8A">unit tests .. PASS</text><text x="36" y="274" class="m" font-size="11" font-weight="700" fill="#C2382F">dbt build ... FAIL  unique(order_id)</text></g>
<g class="f" data-step="4"><line x1="354" y1="120" x2="470" y2="120" stroke="#531A8A" stroke-width="1.6"/><circle cx="470" cy="120" r="14" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text x="470" y="124" text-anchor="middle" class="m" font-size="11" font-weight="700" fill="#17151F">f6</text><rect x="34" y="263" width="300" height="16" fill="#fff"/><text x="36" y="274" class="m" font-size="11" font-weight="400" fill="#531A8A">dbt build ... PASS</text><text x="400" y="238" class="m" font-size="11" font-weight="700" fill="#17151F">review: approved</text><text x="400" y="256" class="m" font-size="11" font-weight="400" fill="#5C5869">1 comment resolved</text></g>
<g class="f" data-step="5"><line x1="214" y1="64" x2="640" y2="64" stroke="#3D3A49" stroke-width="1.6"/><line x1="484" y1="113" x2="626" y2="70" stroke="#8C8899" stroke-width="1.4" stroke-dasharray="4 4"/><circle cx="640" cy="64" r="14" fill="#531A8A" stroke="#531A8A" stroke-width="1.4"/><text x="640" y="68" text-anchor="middle" class="m" font-size="11" font-weight="700" fill="#fff">S</text><text x="400" y="274" class="m" font-size="11" font-weight="700" fill="#531A8A">squash-merged · branch deleted</text></g>
</svg>
<ol class="lx-caps">
  <li><b>main</b> is <b>protected</b>: nobody pushes to it directly. Changes arrive only through PRs that pass checks and get an approval.</li>
  <li>You create a branch, commit your change to the orders model and <b>push</b> it to the host.</li>
  <li>You open <b>PR #128</b>. Reviewers see the diff, the description and the target branch.</li>
  <li><b>CI runs automatically</b> on the PR. Lint and unit tests pass, but the dbt uniqueness test <b>fails</b>: merging is blocked.</li>
  <li>You push a fix commit to the same branch. Checks re-run and pass, and a reviewer <b>approves</b>.</li>
  <li>The PR is <b>squash-merged</b>: the branch's changes land on main as one new commit <b>S</b>, the branch is deleted, and the deploy pipeline starts from main.</li>
</ol>
{{< /fig >}}

## Comparing the platforms

| | GitHub | GitLab | Bitbucket |
|---|---|---|---|
| Owner | Microsoft | GitLab Inc. | Atlassian |
| Built-in CI/CD | GitHub Actions | GitLab CI/CD | Bitbucket Pipelines |
| Self-hosted option | GitHub Enterprise Server | GitLab Self-Managed (free CE or paid EE) | Bitbucket Data Center |
| Strengths | Largest open-source community, Actions marketplace, Copilot | Single DevOps platform, strong self-hosting, built-in security scanning | Tight Jira and Confluence integration |
| Review unit | Pull request | Merge request | Pull request |

All three speak plain Git, so moving a repository between them is easy; moving CI pipelines, issues and permissions is the real migration work.

## What is in this section

- [GitHub]({{< relref "github" >}}): Actions, branch protection and rulesets, CODEOWNERS, and the open-source ecosystem.
- [GitLab]({{< relref "gitlab" >}}): the all-in-one, self-hostable DevOps platform.
- [Bitbucket]({{< relref "bitbucket" >}}): Atlassian's Git host for Jira-centric teams.

## Good PR habits

- **Small PRs.** Under ~400 changed lines get real reviews; 3,000-line PRs get rubber stamps.
- **Describe the why and the impact.** For data changes, say which tables change, whether a backfill is needed, and what downstream dashboards see.
- **Let CI do the nitpicking.** Formatters and linters in CI keep reviews focused on logic.
- **Require at least one approval and passing checks** on `main`, and use CODEOWNERS so the right team reviews each folder.

## Learning Resources

- [About pull requests (GitHub Docs)](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests)
- [Merge requests (GitLab Docs)](https://docs.gitlab.com/user/project/merge_requests/)
- [Google engineering practices: code review](https://google.github.io/eng-practices/review/)
