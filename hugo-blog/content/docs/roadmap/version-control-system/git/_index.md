---
title: "git"
description: "Git for data engineers, animated: the four places your code lives, one-time setup, branches and HEAD, merge vs rebase, and your first push."
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
3. **Four places**: your **working tree**, the **staging area**, your **local repository** and a **remote**. Every everyday command moves changes from one place to the next.

Git is not GitHub. Git is the tool on your machine and works fully offline; GitHub, GitLab and Bitbucket host a shared copy and add pull requests, review and CI on top.

## Four places your code lives

{{< fig kicker="$ git add · git commit · git push · git fetch · git pull" title="One change travels from your editor to the team, and the team's work comes back" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 344">
  <defs><marker id="gfp-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#531A8A"/></marker></defs>
  <g class="m" font-size="11.5" fill="#5C5869" text-anchor="middle">
    <path d="M20 40v-6h535v6" fill="none" stroke="#C9C6D3"/><text x="287" y="26">your machine</text>
    <path d="M575 40v-6h165v6" fill="none" stroke="#C9C6D3"/><text x="657" y="26">GitHub · GitLab</text>
  </g>
  <rect x="20" y="96" width="165" height="124" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
  <text class="m" x="32" y="118" font-size="12.5" font-weight="700" fill="#17151F">WORKING TREE</text>
  <text class="m" x="32" y="136" font-size="11" fill="#5C5869">your files on disk</text>
  <rect x="205" y="96" width="165" height="124" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
  <text class="m" x="217" y="118" font-size="12.5" font-weight="700" fill="#17151F">STAGING AREA</text>
  <text class="m" x="217" y="136" font-size="11" fill="#5C5869">index: the next commit</text>
  <rect x="390" y="96" width="165" height="124" rx="6" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/>
  <text class="m" x="402" y="118" font-size="12.5" font-weight="700" fill="#17151F">LOCAL REPO</text>
  <text class="m" x="402" y="136" font-size="11" fill="#5C5869">.git: every commit</text>
  <rect x="575" y="96" width="165" height="124" rx="6" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/>
  <text class="m" x="587" y="118" font-size="12.5" font-weight="700" fill="#531A8A">REMOTE</text>
  <text class="m" x="587" y="136" font-size="11" fill="#5C5869">origin: shared copy</text>
  <g class="m" font-size="11">
    <rect x="30" y="150" width="145" height="24" rx="4" fill="#fff" stroke="#C9C6D3"/>
    <text x="38" y="166" fill="#17151F">report.py</text><text x="167" y="166" text-anchor="end" fill="#8C8899">untracked</text>
    <rect x="30" y="182" width="145" height="24" rx="4" fill="#F4EEFA" stroke="#531A8A"/>
    <text x="38" y="198" fill="#17151F">orders.sql</text><text x="167" y="198" text-anchor="end" fill="#531A8A">modified</text>
  </g>
  <g class="f" data-step="1">
    <path class="flow" d="M117 96C117 60 272 60 272 92" fill="none" stroke="#531A8A" stroke-width="1.6" marker-end="url(#gfp-a)"/>
    <text class="m" x="195" y="62" font-size="12" font-weight="700" fill="#531A8A" text-anchor="middle">git add</text>
    <circle class="pkt-dot" r="5"><animateMotion dur="1.6s" repeatCount="indefinite" path="M117 96C117 60 272 60 272 92"/></circle>
  </g>
  <g class="f pop" data-step="1" font-size="11">
    <rect x="215" y="150" width="145" height="24" rx="4" fill="#F4EEFA" stroke="#531A8A"/>
    <text class="m" x="223" y="166" fill="#17151F">orders.sql</text><text class="m" x="352" y="166" text-anchor="end" fill="#531A8A">staged</text>
  </g>
  <g class="f" data-step="2">
    <path class="flow" d="M302 96C302 60 457 60 457 92" fill="none" stroke="#531A8A" stroke-width="1.6" marker-end="url(#gfp-a)"/>
    <text class="m" x="380" y="62" font-size="12" font-weight="700" fill="#531A8A" text-anchor="middle">git commit</text>
    <circle class="pkt-dot" r="5"><animateMotion dur="1.6s" repeatCount="indefinite" path="M302 96C302 60 457 60 457 92"/></circle>
  </g>
  <g class="f pop" data-step="2" font-size="11">
    <rect x="400" y="150" width="145" height="24" rx="4" fill="#F4EEFA" stroke="#531A8A"/>
    <text class="m" x="408" y="166" font-weight="700" fill="#17151F">3f2a1c9</text><text class="m" x="537" y="166" text-anchor="end" fill="#531A8A">main</text>
  </g>
  <g class="f" data-step="3">
    <path class="flow" d="M487 96C487 60 642 60 642 92" fill="none" stroke="#531A8A" stroke-width="1.6" marker-end="url(#gfp-a)"/>
    <text class="m" x="565" y="62" font-size="12" font-weight="700" fill="#531A8A" text-anchor="middle">git push</text>
    <circle class="pkt-dot" r="5"><animateMotion dur="1.6s" repeatCount="indefinite" path="M487 96C487 60 642 60 642 92"/></circle>
  </g>
  <g class="f pop" data-step="3" font-size="11">
    <rect x="585" y="150" width="145" height="24" rx="4" fill="#fff" stroke="#531A8A"/>
    <text class="m" x="593" y="166" font-weight="700" fill="#17151F">3f2a1c9</text><text class="m" x="722" y="166" text-anchor="end" fill="#531A8A">yours</text>
  </g>
  <g class="f slide-l" data-step="4" font-size="11">
    <rect x="585" y="182" width="145" height="24" rx="4" fill="#fff" stroke="#3D3A49"/>
    <text class="m" x="593" y="198" font-weight="700" fill="#17151F">8b4e0d2</text><text class="m" x="722" y="198" text-anchor="end" fill="#5C5869">teammate</text>
  </g>
  <g class="f" data-step="4">
    <path class="flow" d="M642 220C642 258 487 258 487 224" fill="none" stroke="#3D3A49" stroke-width="1.6" marker-end="url(#gfp-a)"/>
    <text class="m" x="565" y="264" font-size="12" font-weight="700" fill="#3D3A49" text-anchor="middle">git fetch</text>
    <circle class="pkt-dot ink" r="5"><animateMotion dur="1.6s" repeatCount="indefinite" path="M642 220C642 258 487 258 487 224"/></circle>
    <rect x="398" y="182" width="149" height="24" rx="4" fill="#fff" stroke="#3D3A49"/>
    <text class="m" x="405" y="198" font-size="11" fill="#5C5869">origin/main</text><text class="m" x="540" y="198" font-size="11" text-anchor="end" font-weight="700" fill="#17151F">8b4e0d2</text>
  </g>
  <g class="f" data-step="5">
    <path class="flow" d="M665 220C665 340 102 340 102 224" fill="none" stroke="#531A8A" stroke-width="1.6" marker-end="url(#gfp-a)"/>
    <text class="m" x="384" y="334" font-size="12" font-weight="700" fill="#531A8A" text-anchor="middle">git pull = fetch + merge into your files</text>
    <circle class="pkt-dot" r="5"><animateMotion dur="2.2s" repeatCount="indefinite" path="M665 220C665 340 102 340 102 224"/></circle>
  </g>
</svg>
<ol class="lx-caps">
  <li>You edited <code>orders.sql</code> and created <code>report.py</code>. <code>git status</code> calls the first <b>modified</b> and the second <b>untracked</b>: Git has never stored it.</li>
  <li><code>git add orders.sql</code> copies the change into the <b>staging area</b>. Only staged changes go into the next commit; <code>report.py</code> stays out.</li>
  <li><code>git commit</code> turns the staging area into a permanent snapshot in <b>.git</b>, with an ID like <code>3f2a1c9</code>. Still only on your laptop.</li>
  <li><code>git push</code> uploads your new commits to the <b>remote</b>, so the team can see them.</li>
  <li>A teammate pushed <code>8b4e0d2</code>. <code>git fetch</code> downloads it and moves <code>origin/main</code>, but your files do not change.</li>
  <li><code>git pull</code> is fetch plus merge: the teammate's change lands in your working tree. Pull before you start, and before you push.</li>
</ol>
{{< /fig >}}

`git status` tells you where each file is:

| State | Meaning | Next command |
|---|---|---|
| Untracked | New file Git has never stored | `git add file`, or list it in `.gitignore` |
| Modified | Tracked file changed, not staged | `git add file`, or `git restore file` to drop the edit |
| Staged | Will be in the next commit | `git commit`, or `git restore --staged file` to unstage |
| Committed (clean) | Working tree matches the last commit | `git push` to share it |

```bash
git status
git diff                            # unstaged changes, line by line
git add models/orders.sql           # or: git add -p to pick hunks
git diff --staged                   # what will be committed
git commit -m "Deduplicate orders on order_id"
git log --oneline
```

A `.gitignore` file keeps secrets and junk out of the staging area: `.env`, `*.log`, `__pycache__/`, `target/`, local data files.

## One-time setup

Tell Git who you are, once per machine. The name and email are written into every commit.

```bash
git config --global user.name "Alice Example"
git config --global user.email "alice@example.com"
git config --global init.defaultBranch main
git config --global pull.rebase true        # optional: git pull rebases instead of merging
```

Then let GitHub or GitLab recognize your machine with an [SSH]({{< relref "/docs/roadmap/networking/protocols/ssh" >}}) key, so you never type a password to push:

```bash
ssh-keygen -t ed25519 -C "alice@example.com"   # creates ~/.ssh/id_ed25519 and id_ed25519.pub
cat ~/.ssh/id_ed25519.pub                      # paste into GitHub › Settings › SSH and GPG keys
ssh -T git@github.com                          # "Hi alice! You've successfully authenticated..."
```

Start a repository with `git init` in an existing folder, or copy one with `git clone git@github.com:example/pipelines.git`.

## Branches

A branch lets you work on a change without touching `main`. **HEAD** is the pointer to the branch you are on; new commits go on that branch, and the branch label moves forward with them.

{{< fig kicker="$ git switch -c feature/login" title="A branch is a label that moves; HEAD says which label you are on" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 760 290">
  <defs><marker id="gbr-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#531A8A"/></marker></defs>
  <text class="m" x="20" y="26" font-size="11.5" fill="#5C5869">your laptop</text>
  <line x1="70" y1="200" x2="160" y2="200" stroke="#3D3A49" stroke-width="1.6"/>
  <circle cx="70" cy="200" r="15" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text class="m" x="70" y="204" text-anchor="middle" font-size="11" font-weight="700" fill="#17151F">A</text>
  <circle cx="160" cy="200" r="15" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text class="m" x="160" y="204" text-anchor="middle" font-size="11" font-weight="700" fill="#17151F">B</text>
  <rect x="137" y="222" width="46" height="20" rx="4" fill="#260246"/><text class="m" x="160" y="236" text-anchor="middle" font-size="11" fill="#EEEAF5">main</text>
  <rect x="137" y="248" width="46" height="20" rx="4" fill="#fff" stroke="#531A8A" stroke-width="1.4"/><text class="m" x="160" y="262" text-anchor="middle" font-size="11" font-weight="700" fill="#531A8A">HEAD</text>
  <g class="f pop" data-step="1">
    <rect x="134" y="246" width="52" height="24" fill="#FBFBFE"/>
    <line x1="150" y1="170" x2="154" y2="186" stroke="#531A8A" stroke-width="1.2"/>
    <rect x="60" y="150" width="104" height="20" rx="4" fill="#531A8A"/><text class="m" x="112" y="164" text-anchor="middle" font-size="11" fill="#fff">feature/login</text>
    <rect x="89" y="124" width="46" height="20" rx="4" fill="#fff" stroke="#531A8A" stroke-width="1.4"/><text class="m" x="112" y="138" text-anchor="middle" font-size="11" font-weight="700" fill="#531A8A">HEAD</text>
  </g>
  <g class="f" data-step="2">
    <rect x="56" y="120" width="112" height="54" fill="#FBFBFE"/>
    <rect x="148" y="169" width="10" height="18" fill="#FBFBFE"/>
    <line x1="160" y1="200" x2="250" y2="110" stroke="#531A8A" stroke-width="1.6"/>
    <circle cx="160" cy="200" r="15" fill="#fff" stroke="#3D3A49" stroke-width="1.4"/><text class="m" x="160" y="204" text-anchor="middle" font-size="11" font-weight="700" fill="#17151F">B</text>
  </g>
  <g class="f pop" data-step="2">
    <circle cx="250" cy="110" r="15" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text class="m" x="250" y="114" text-anchor="middle" font-size="11" font-weight="700" fill="#17151F">C</text>
    <rect x="198" y="62" width="104" height="20" rx="4" fill="#531A8A"/><text class="m" x="250" y="76" text-anchor="middle" font-size="11" fill="#fff">feature/login</text>
    <rect x="227" y="36" width="46" height="20" rx="4" fill="#fff" stroke="#531A8A" stroke-width="1.4"/><text class="m" x="250" y="50" text-anchor="middle" font-size="11" font-weight="700" fill="#531A8A">HEAD</text>
  </g>
  <g class="f" data-step="3">
    <rect x="194" y="32" width="112" height="54" fill="#FBFBFE"/>
    <line x1="265" y1="110" x2="325" y2="110" stroke="#531A8A" stroke-width="1.6"/>
  </g>
  <g class="f pop" data-step="3">
    <circle cx="340" cy="110" r="15" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.4"/><text class="m" x="340" y="114" text-anchor="middle" font-size="11" font-weight="700" fill="#17151F">D</text>
    <rect x="288" y="62" width="104" height="20" rx="4" fill="#531A8A"/><text class="m" x="340" y="76" text-anchor="middle" font-size="11" fill="#fff">feature/login</text>
    <rect x="317" y="36" width="46" height="20" rx="4" fill="#fff" stroke="#531A8A" stroke-width="1.4"/><text class="m" x="340" y="50" text-anchor="middle" font-size="11" font-weight="700" fill="#531A8A">HEAD</text>
  </g>
  <g class="f slide-l" data-step="4">
    <rect x="470" y="40" width="270" height="210" rx="8" fill="#fff" stroke="#531A8A" stroke-width="1.4"/>
    <text class="m" x="484" y="62" font-size="12" font-weight="700" fill="#531A8A">origin · GitHub</text>
    <line x1="500" y1="200" x2="555" y2="200" stroke="#3D3A49" stroke-width="1.4"/>
    <line x1="555" y1="200" x2="615" y2="140" stroke="#531A8A" stroke-width="1.4"/>
    <line x1="615" y1="140" x2="675" y2="140" stroke="#531A8A" stroke-width="1.4"/>
    <circle cx="500" cy="200" r="12" fill="#fff" stroke="#3D3A49" stroke-width="1.3"/><text class="m" x="500" y="204" text-anchor="middle" font-size="11" font-weight="700" fill="#17151F">A</text>
    <circle cx="555" cy="200" r="12" fill="#fff" stroke="#3D3A49" stroke-width="1.3"/><text class="m" x="555" y="204" text-anchor="middle" font-size="11" font-weight="700" fill="#17151F">B</text>
    <circle cx="615" cy="140" r="12" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.3"/><text class="m" x="615" y="144" text-anchor="middle" font-size="11" font-weight="700" fill="#17151F">C</text>
    <circle cx="675" cy="140" r="12" fill="#F4EEFA" stroke="#531A8A" stroke-width="1.3"/><text class="m" x="675" y="144" text-anchor="middle" font-size="11" font-weight="700" fill="#17151F">D</text>
    <rect x="623" y="100" width="104" height="20" rx="4" fill="#531A8A"/><text class="m" x="675" y="114" text-anchor="middle" font-size="11" fill="#fff">feature/login</text>
    <rect x="532" y="220" width="46" height="20" rx="4" fill="#260246"/><text class="m" x="555" y="234" text-anchor="middle" font-size="11" fill="#EEEAF5">main</text>
    <line class="flow" x1="380" y1="165" x2="464" y2="165" stroke="#531A8A" stroke-width="1.6" marker-end="url(#gbr-a)"/>
    <circle class="pkt-dot" r="5"><animateMotion dur="1.4s" repeatCount="indefinite" path="M380 165 L462 165"/></circle>
    <rect x="274" y="124" width="132" height="20" rx="4" fill="#fff" stroke="#3D3A49" stroke-dasharray="3 2"/><text class="m" x="340" y="138" text-anchor="middle" font-size="11" fill="#17151F">origin/feature/login</text>
    <text class="m" x="470" y="276" font-size="12" font-weight="700" fill="#531A8A">$ git push -u origin feature/login</text>
  </g>
  <g class="f pop" data-step="5">
    <rect x="313" y="32" width="54" height="27" fill="#FBFBFE"/>
    <rect x="137" y="248" width="46" height="20" rx="4" fill="#fff" stroke="#531A8A" stroke-width="1.4"/><text class="m pulse" x="160" y="262" text-anchor="middle" font-size="11" font-weight="700" fill="#531A8A">HEAD</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>History so far: commits A and B on <b>main</b>. <b>HEAD</b> points at main, so that is the branch you are on.</li>
  <li><code>git switch -c feature/login</code> creates a new label at the same commit and moves HEAD to it. No files are copied.</li>
  <li>Edit, <code>git add</code>, <code>git commit</code>: the new commit C goes on <b>feature/login</b>, and the label moves forward with HEAD. main stays at B.</li>
  <li>Another commit, D. Each commit points back to its parent, so the branch is simply the chain behind its label.</li>
  <li><code>git push -u origin feature/login</code> uploads C and D and creates the branch on the remote. <code>-u</code> links the two, so later a plain <code>git push</code> is enough.</li>
  <li><code>git switch main</code> moves HEAD back to B and rewrites your files to match it. Your feature work is safe on its own branch, ready for a pull request.</li>
</ol>
{{< /fig >}}

```bash
git branch                     # list local branches; * marks the current one
git switch -c feature/login    # create and switch
git switch main                # go back (commit or stash your changes first)
git branch -d feature/login    # delete after it has been merged
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

## Your first push

From an empty folder to a merged pull request, using the commands above:

1. Create an empty repository on GitHub called `workshop`, with no README, so the first push has nothing to conflict with.
2. Start the local repository and make the first commit:
   ```bash
   cd ~/workshop
   git init
   git add backup.sh
   git commit -m "Add backup script"
   ```
3. Keep generated files out: `echo "*.tar.gz" > .gitignore`, then add and commit `.gitignore`.
4. Check the SSH key, connect the remote and push `main`:
   ```bash
   ssh -T git@github.com
   git remote add origin git@github.com:<you>/workshop.git
   git remote -v                  # origin is just a nickname for that URL
   git push -u origin main
   ```
5. On a new branch, add `README.md`, commit it and push the branch: `git switch -c add-readme`, `git add README.md`, `git commit -m "Add README"`, `git push -u origin add-readme`.
6. Open a pull request on GitHub, merge it, then update your local copy: `git switch main` and `git pull`.
7. Look at the result: `git log --oneline --graph --all`.
8. Bonus: edit the same line on GitHub and locally, pull, and resolve the conflict. Git marks it between `<<<<<<<`, `=======` and `>>>>>>>`; keep what you want, delete the markers, then add and commit.

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
