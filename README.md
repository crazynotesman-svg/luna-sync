# Luna Sync — Landing Page

Static site, deployable to Cloudflare Pages.

## Structure

```
luna-sync/
├── index.html          # Main page (path-based i18n routing)
├── vercel.json          # CF Pages-compatible routing config
├── assets/
│   ├── icon1024x1024bb.png
│   ├── 1.png … 5.png   # App screenshots
├── i18n/
│   ├── en.json          # English dictionary
│   └── zh.json          # Chinese dictionary
└── js/
    └── i18n.js          # i18n engine
```

## Deploy to Cloudflare Pages

1. Push this repo to GitHub.
2. In Cloudflare Dashboard → Pages → Connect Git repository.
3. Build settings: **Framework preset = None**, **Build command = (leave empty)**, **Build output = `.`** (root).
4. Deploy.

## Languages

- `/en/` — English (default)
- `/zh/` — Chinese

## Notes

- All app data stays on-device — no server, no cloud, no tracking.
- JSON-LD: SoftwareApplication + FAQPage + BreadcrumbList.
- Hreflang tags prevent duplicate content penalties.