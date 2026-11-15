# DataBurst Data Engineering Wiki

Source of [wiki.databurst.tech](https://wiki.databurst.tech): a free, open data engineering wiki built with [Hugo](https://gohugo.io) and the [hugo-book](https://github.com/alex-shpak/hugo-book) theme, with step-by-step animated figures.

```bash
git clone --recurse-submodules https://github.com/data-burst/data-engineering-wiki
cd data-engineering-wiki/hugo-blog && hugo server
```

Or with Docker: `docker compose up --build`, then open http://localhost:1313.

| Path | What lives there |
|---|---|
| `hugo-blog/content/docs/` | Pages (Markdown) |
| `hugo-blog/layouts/_shortcodes/fig.html` | Animated figure shortcode |
| `hugo-blog/assets/lesson/` | Site styles and the figure engine |
| `hugo-blog/layouts/_partials/seo.html` | JSON-LD, Twitter cards |
| `hugo-blog/layouts/home.llms.txt`, `robots.txt` | `llms.txt` and crawler rules |

See [CONTRIBUTING.md](CONTRIBUTING.md) to add or improve a page.
