---
title: "git"
description: "Git explained for data engineers: commits, the three areas, branches as pointers, merge vs rebase animated, everyday commands, and a workflow that works."
weight: 1
bookToC: false
---
<div class="lx-kicker-line">$ git log --oneline --graph --all</div>

# Git

**Git** is a distributed version control system: every clone of a repository holds the complete history, so you can commit, branch and compare versions offline and sync with others later. Linus Torvalds wrote it in 2005 for Linux kernel development; today it is the standard for virtually all software and data projects.

## The mental model

Three ideas explain most of Git:

1. **A commit is a snapshot** of the whole project, plus metadata (author, message) and a pointer to its **parent** commit(s). Its ID is a hash of all of that, so changing anything in history creates new commits with new IDs.
2. **A branch is just a movable pointer** to a commit. `main` and `feature` are labels; creating a branch costs a few bytes.
3. **Three areas**: the **working tree** (your files), the **staging area** or index (what goes into the next commit) and the **repository** (committed history).

```bash
git switch -c fix-orders-dedup      # new branch from the current commit
# edit models/orders.sql
git add models/orders.sql           # working tree → staging area
git commit -m "Deduplicate orders on order_id"   # staging → repository
git push -u origin fix-orders-dedup # share it
```

## Merge vs rebase

Sooner or later `main` moves on while you work on a branch. There are two ways to combine the histories.

{{< fig kicker="$ git merge feature   vs   git rebase main" title="Same starting point, two ways to integrate a branch" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 340">
<rect x="10" y="10" width="740" height="162" rx="8" fill="#fff" stroke="#E7E7EF"/>
<rect x="10" y="182" width="740" height="152" rx="8" fill="#fff" stroke="#E7E7EF"/>
<text x="24" y="32" class="m" font-size="12" font-weight="700" fill="#531A8A">git merge feature</text>
<text x="24" y="198" class="m" font-size="12" font-weight="700" fill="#531A8A">git rebase main</text>
<line x1="80" y1="78" x2="260" y2="78" stroke="#3D3A49" stroke-width="1.6"/><line x1="170" y1="78" x2="260" y2="133" stroke="#531A8A" stroke-width="1.6"/><line x1="260" y1="133" x2="350" y2="133" stroke="#531A8A" stroke-width="1.6"/><circle cx="80" cy="78" r="15" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="80" y="82" text-anchor="middle" class="m" font-size="11" font-weight="700" fill="#17151F">A</text><circle cx="170" cy="78" r="15" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="170" y="82" text-anchor="middle" class="m" font-size="11" font-weight="700" fill="#17151F">B</text><circle cx="260" cy="78" r="15" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="260" y="82" text-anchor="middle" class="m" font-size="11" font-weight="700" fill="#17151F">C</text><circle cx="260" cy="133" r="15" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text x="260" y="137" text-anchor="middle" class="m" font-size="11" font-weight="700" fill="#17151F">D</text><circle cx="350" cy="133" r="15" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text x="350" y="137" text-anchor="middle" class="m" font-size="11" font-weight="700" fill="#17151F">E</text><rect x="238" y="36" width="42" height="18" rx="4" fill="#260246"/><text x="245" y="49" class="m" font-size="11" fill="#EEEAF5">main</text><rect x="318" y="152" width="63" height="18" rx="4" fill="#260246"/><text x="325" y="165" class="m" font-size="11" fill="#EEEAF5">feature</text>
<line x1="80" y1="244" x2="260" y2="244" stroke="#3D3A49" stroke-width="1.6"/><line x1="170" y1="244" x2="260" y2="299" stroke="#531A8A" stroke-width="1.6"/><line x1="260" y1="299" x2="350" y2="299" stroke="#531A8A" stroke-width="1.6"/><circle cx="80" cy="244" r="15" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="80" y="248" text-anchor="middle" class="m" font-size="11" font-weight="700" fill="#17151F">A</text><circle cx="170" cy="244" r="15" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="170" y="248" text-anchor="middle" class="m" font-size="11" font-weight="700" fill="#17151F">B</text><circle cx="260" cy="244" r="15" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text x="260" y="248" text-anchor="middle" class="m" font-size="11" font-weight="700" fill="#17151F">C</text><circle cx="260" cy="299" r="15" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text x="260" y="303" text-anchor="middle" class="m" font-size="11" font-weight="700" fill="#17151F">D</text><circle cx="350" cy="299" r="15" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text x="350" y="303" text-anchor="middle" class="m" font-size="11" font-weight="700" fill="#17151F">E</text><rect x="238" y="202" width="42" height="18" rx="4" fill="#260246"/><text x="245" y="215" class="m" font-size="11" fill="#EEEAF5">main</text><rect x="374" y="290" width="63" height="18" rx="4" fill="#260246"/><text x="381" y="303" class="m" font-size="11" fill="#EEEAF5">feature</text>
<g class="f" data-step="1"><rect x="236" y="34" width="50" height="22" fill="#fff" fill-opacity="1"/><line x1="275" y1="78" x2="480" y2="78" stroke="#3D3A49" stroke-width="1.6"/><line x1="364" y1="127" x2="480" y2="78" stroke="#531A8A" stroke-width="1.6"/><circle cx="480" cy="78" r="15" fill="#531A8A" stroke="#531A8A" stroke-width="1.4"/><text x="480" y="82" text-anchor="middle" class="m" font-size="11" font-weight="700" fill="#fff">M</text><rect x="458" y="36" width="42" height="18" rx="4" fill="#260246"/><text x="465" y="49" class="m" font-size="11" fill="#EEEAF5">main</text></g>
<g class="f" data-step="2"><text x="520" y="110" font-size="12" fill="#3D3A49">M has two parents: C and E.</text><text x="520" y="128" font-size="12" fill="#3D3A49">D and E keep their hashes.</text></g>
<g class="f" data-step="3"><rect x="196" y="268" width="262" height="50" fill="#fff" fill-opacity="0.85"/><line x1="275" y1="244" x2="440" y2="244" stroke="#531A8A" stroke-width="1.6"/><circle cx="350" cy="244" r="15" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text x="350" y="248" text-anchor="middle" class="m" font-size="11" font-weight="700" fill="#17151F">D′</text><circle cx="440" cy="244" r="15" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text x="440" y="248" text-anchor="middle" class="m" font-size="11" font-weight="700" fill="#17151F">E′</text><rect x="462" y="235" width="63" height="18" rx="4" fill="#260246"/><text x="469" y="248" class="m" font-size="11" fill="#EEEAF5">feature</text><text x="520" y="290" font-size="12" fill="#8C8899">old D, E: unreferenced</text></g>
<g class="f" data-step="4"><rect x="236" y="200" width="50" height="22" fill="#fff" fill-opacity="1"/><rect x="418" y="202" width="42" height="18" rx="4" fill="#260246"/><text x="425" y="215" class="m" font-size="11" fill="#EEEAF5">main</text><text x="560" y="214" font-size="12" fill="#3D3A49">fast-forward: linear</text></g>
</svg>
<ol class="lx-caps">
  <li>Both panels start the same: <b>feature</b> branched off at B and added D and E, while <b>main</b> gained C.</li>
  <li><b>Merge</b>: Git creates a new <b>merge commit M</b> that joins both lines, and <b>main</b> moves to it.</li>
  <li>M has <b>two parents</b>. Nothing was rewritten: the history shows what really happened, including the parallel work.</li>
  <li><b>Rebase</b>: Git replays D and E on top of C as <b>new commits D′ and E′</b>, with new hashes. The old D and E are left behind.</li>
  <li>Now main can <b>fast-forward</b> to E′: a straight, linear history with no merge commit. The cost: D′ and E′ are different commits from what you pushed before.</li>
</ol>
{{< /fig >}}

| | Merge | Rebase |
|---|---|---|
| History shape | True shape, with merge commits | Linear, easy to read and `bisect` |
| Rewrites commits | No | Yes: new hashes |
| Safe on shared branches | Yes | No: others have the old commits |
| Conflicts | Resolved once, in the merge commit | Possibly once per replayed commit |

The rule of thumb: **rebase your own local branch** onto `main` to keep it current and tidy; **never rebase commits others have already pulled**. Many teams avoid the question by using **squash merge** in pull requests: the whole branch lands on `main` as one commit.

## Everyday commands

| Command | What it does |
|---|---|
| `git status`, `git diff`, `git diff --staged` | What changed, staged or not |
| `git log --oneline --graph` | Compact history |
| `git switch <branch>`, `git switch -c <new>` | Change or create branches |
| `git pull --rebase` | Fetch and replay your local commits on top |
| `git restore <file>` | Discard working-tree changes to a file |
| `git commit --amend` | Fix the last commit (before pushing) |
| `git revert <commit>` | Undo a commit with a new commit: safe on shared branches |
| `git reset --soft HEAD~1` | Un-commit, keep the changes staged |
| `git stash` | Park uncommitted work temporarily |
| `git bisect` | Binary-search history for the commit that broke something |
| `git reflog` | Every position HEAD has been: how you recover "lost" commits |

## A workflow for data repositories

- **Trunk-based development**: short-lived branches (hours to days), merged to `main` through pull requests with CI. Avoid long-lived `develop` branches; they drift and merge painfully.
- Keep each change small and focused: one model, one DAG, one migration.
- Write commit messages that say **why**: "Deduplicate orders on order_id (late CDC events cause doubles)" beats "fix".
- Use **pre-commit** hooks for formatting (`ruff`, `sqlfluff`) and secret scanning.
- Large files that must live with code (small seed CSVs are fine; models and media are not) belong in **Git LFS**.

## Common mistakes

- **Committing secrets.** Deleting the file later does not remove it from history. Rotate the secret immediately; then clean history if needed.
- **`git push --force` on a shared branch.** It silently discards others' commits. Use `--force-with-lease`, and only on your own branches.
- **Huge, mixed commits.** A commit that changes ten models and the CI config is hard to review and impossible to revert cleanly.
- **Committing data and notebooks with outputs.** Repository size explodes and diffs become unreadable. Strip notebook outputs (nbstripout) and keep data elsewhere.

## Learning Resources

### Books

- [Pro Git, Scott Chacon and Ben Straub (free online)](https://git-scm.com/book/en/v2)
- [Version Control with Git, 3rd ed. (O'Reilly)](https://www.oreilly.com/library/view/version-control-with/9781492091189/)

### Interactive

- [Learn Git Branching](https://learngitbranching.js.org/): visual, in-browser exercises for merge, rebase and more
- [Oh Shit, Git!?!](https://ohshitgit.com/): how to get out of common messes

### Reference

- [Git documentation](https://git-scm.com/docs)
- [Git internals: Git objects (Pro Git)](https://git-scm.com/book/en/v2/Git-Internals-Git-Objects)
- [Trunk-based development](https://trunkbaseddevelopment.com/)
