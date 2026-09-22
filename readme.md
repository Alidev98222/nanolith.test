# NANOLITH â€” Corporate Website (Static, GitHub Pages)

Production/handoff notes for the six-page static build.
Design system: **"Blueprint Precision"** â€” tokens live in `nanolith.css`
(and mirrored inline in `index.html`; keep both in sync when editing).

## 1. Repository structure

```
index.html          Home (self-contained CSS; no shared-file dependency)
technology.html     Technology / R&D
products.html       Products & Solutions  (+ ?ds=<id> data-sheet view)
about.html          About Us & Team
insights.html       Insights / News       (+ ?a=<slug> article view)
contact.html        Contact & Inquiry
nanolith.css        Shared design system (all pages except home)
nanolith.js         Shared behaviors + content stores + JSON-LD injection
sitemap.xml         18 URLs (6 pages + 6 data sheets + 6 articles)
robots.txt          Allows all, points to sitemap
```

In-page views are query-param based (GitHub-Pages-safe and shareable):
`products.html?ds=nl-grid` â†’ printable data sheet آ· `insights.html?a=hybrid-resists` â†’ article.

## 2. Deployment (GitHub Pages)

1. **Current setup works:** all files in repo root, Pages enabled. Nothing else required.
2. **Custom domain (recommended, free):**
   - Repo â†’ Settings â†’ Pages â†’ Custom domain: `www.nanolith.com`
   - DNS at your registrar: `CNAME` record `www` â†’ `<username>.github.io`;
     apex `A` records for `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - Re-open Settings â†’ Pages until **Enforce HTTPS** unlocks, then enable it.
3. **Base-path warning:** project pages live under `https://<user>.github.io/<repo>/`.
   Relative links work either way, but `sitemap.xml` / `robots.txt` need absolute URLs â€”
   if you stay on the subpath, prefix every URL there with `/<repo>/`.
   A custom domain removes this concern entirely.
4. **Domain find-replace:** replace `https://www.nanolith.com/` with the final domain in
   `sitemap.xml`, `robots.txt`, `nanolith.js` (`SITE_URL`), and the canonical/OG tags of every page.

## 3. Inquiry form (free backend)

1. Register a free account at **Formspree** (formspree.io) or **Web3Forms** (web3forms.com).
2. Copy your form endpoint.
3. Paste it into `FORM_ENDPOINT` in `nanolith.js` (bottom module).
4. Until then, submissions open a pre-filled email via the `mailto:` fallback â€”
   functional, but dependent on the visitor's mail client. The honeypot anti-spam is active either way.

## 4. Data-sheet PDF export

Open `products.html?ds=<id>` â†’ browser Print â†’ **Save as PDF**.
Print CSS strips nav/footer/toolbar and outputs a clean A4 sheet.
The template reads the product store automatically â€” no duplication needed.

## 5. Pre-launch placeholder checklist

| Where | Replace before launch |
|---|---|
| All pages | Company name NANOLITH, emails, address, phone, canonical + OG URLs |
| `index.html` | Trust-strip counters (patents, publications, years, partners) |
| `about.html` | Timeline dates, team names/bios/portraits (swap `.avatar` divs for `<img>`), patent & publication registry numbers |
| `technology.html` | Equipment platforms + `[SAMPLE]` metrics |
| `nanolith.js` | Product `[SAMPLE]` specs â†’ certified test data; `[PLACEHOLDER]` lead times |
| `sitemap.xml` / `robots.txt` / `nanolith.js` | Final domain |

## 6. Performance checklist (target: Lighthouse â‰¥ 90)

Already built in: zero frameworks آ· one shared CSS + one JS آ· `display=swap` fonts with
preconnect آ· IntersectionObserver reveals آ· GPU-light canvas (DPR-capped, pauses when
the tab is hidden) آ· full `prefers-reduced-motion` support آ· almost no raster images.

To verify: Chrome DevTools â†’ Lighthouse â†’ run **Mobile** and **Desktop** on all six pages.
If you add real photos: compress to WebP/AVIF, set explicit `width`/`height`, use `loading="lazy"`.
Small wins still missing: a `favicon.svg` + `<link rel="icon">` on every page, and an
OG image (`1200أ—630` PNG + `<meta property="og:image">`).

## 7. Optional next steps

- `404.html` (GitHub Pages serves it automatically for not-found paths)
- Real Privacy / Terms pages (footer links currently point home)
- Free analytics: Cloudflare Web Analytics or GoatCounter (no cookie banner required)
- Submit the sitemap in Google Search Console once the domain is final