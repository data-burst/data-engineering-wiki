# Contributing

Every page is a plain Markdown file under `hugo-blog/content/docs/`. Most contributions are just that: edit or add a `.md` file and open a PR. Animated figures are **optional**.

## 1. Run it locally

```bash
git clone --recurse-submodules https://github.com/data-burst/data-engineering-wiki
cd data-engineering-wiki/hugo-blog
hugo server        # needs Hugo >= 0.146; open http://localhost:1313
```

Already cloned without submodules? Run `git submodule update --init`.

## 2. Write a page

```markdown
---
title: "Sharding"
description: "One sentence, 120–160 characters, saying what the reader will learn. Shown in Google and AI answers."
weight: 3
---
# Sharding

Start with a one-paragraph plain-English definition. Then explain, then link resources.
```

- **Always set `description`.** It is the search snippet and what AI engines quote.
- Answer the question in the first paragraph, then go deeper.
- Images go next to the page (`sharding/_index.md` + `sharding/diagram.png`).

## 3. Optional: add an animated figure

Wrap HTML in the `fig` shortcode. Anything with class `f` and `data-step="N"` appears at step N. Each `<li>` in `ol.lx-caps` is the caption for step 0, 1, 2, … The **Play / Step** controls are added automatically.

```html
{{< fig kicker="$ ./replicate" title="Leader copies a write to followers" >}}
<svg class="lx-svg lx-canvas" viewBox="0 0 600 200">
  <rect x="20" y="70" width="120" height="60" rx="6" fill="#fff" stroke="#3D3A49"/>
  <text x="80" y="105" text-anchor="middle">Leader</text>
  <g class="f" data-step="1">
    <rect x="440" y="70" width="120" height="60" rx="6" fill="#fff" stroke="#531A8A"/>
    <text x="500" y="105" text-anchor="middle">Follower</text>
  </g>
</svg>
<ol class="lx-caps">
  <li>One leader holds the data.</li>
  <li>A follower receives a copy.</li>
</ol>
{{< /fig >}}
```

No JavaScript is needed for step-by-step reveals. For custom motion (moving packets, live simulations) add a hook in `hugo-blog/assets/lesson/lesson.js` and pass `hook="name"`; see `cap`, `stream` and `rowcol` there as examples.

Optional motion classes for SVG figures (no JavaScript): `pop`, `slide-r`, `slide-l` on an `.f` group change how it appears; `flow` on a dashed line makes it march like moving data; `pulse` gently highlights one element; a `<circle class="pkt-dot">` with an `<animateMotion>` inside an `.f` group draws a moving packet. All of them switch off for readers who prefer reduced motion.

### Style rules

- One accent color (`#531A8A`). Use red (`#C2382F`) only for failure or wrong data. Everything else is navy and grey.
- Monospace (`class="m"` in SVG) for labels, IDs and values; normal text for sentences.
- One idea per step. Keep captions short.

## 4. Open a PR

Merging to `main` builds the Docker image and deploys automatically.
