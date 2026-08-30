# v3 — portfolio

A static site. No build step, no dependencies, no install. Open `index.html`
in a browser and it runs; upload the folder and it is live.

## Layout

```
index.html      the markup, and two scripts that must stay inline (see below)
404.html        the not-found page — deliberately standalone, see below
styles/         the stylesheet, in load order
scripts/        the behaviour, in load order
logos/ photos/ docs/ audio/       assets
```

`styles/` and `scripts/` are numbered because **order is part of the meaning**.
CSS later in the list overrides CSS earlier in it, and the scripts assume the
ones before them have run. Rename or reorder the `<link>` / `<script>` tags in
`index.html` and things break in ways that are hard to see. Adding a file means
adding a tag in the right position.

### styles/

| file | what lives there |
|---|---|
| `01-tokens.css` | the colour tokens and the four palettes, resets, focus ring, skip link |
| `02-hero.css` | the dark hero card, the headline and its lens, the intro copy |
| `03-stage.css` | the cream panel, the portrait, the stickers, the CV buttons |
| `04-view-chrome.css` | sticky bar, corner badge, the flip wipe, the scroll cue |
| `05-sections.css` | section headings, tech stack, certifications, projects, experience |
| `06-progress.css` | scroll progress, the section rail, the skip pill, "what's next" |
| `07-galleries.css` | photo galleries, lightbox, the off-duty band, the form, the footer |
| `08-responsive.css` | every breakpoint: mobile, tablet, portrait monitors, ultrawide |
| `09-feedback.css` | the loading curtain, toasts, form errors, failed images, no-JS |

Media queries that belong to one component sit **with** that component. Only
the two big sweeps — the mobile/accessibility pass and the monitor-size pass —
live together in `08-responsive.css`, because they were written as one piece of
reasoning and read better that way. It loads after the component files so it
wins.

### scripts/

Roughly: `01`–`08` are the hero and the things in it, `09`–`11` are sound,
theme and the "see all" overlays, `12`–`13` are navigation and accessibility,
and `14` is the feedback layer (toasts, the loading rail, image failures,
connection loss).

Every file is one or more self-contained `(function(){ ... })()` blocks. They
talk to each other through four globals only:

| global | set in | used by |
|---|---|---|
| `window.flipView()` | `01-hero.js` | the bar, the badge, the mobile menu |
| `window.sfx` | `09-sound.js` | anything that makes a noise |
| `window.toast(kind, title, detail)` | `14-feedback.js` | the form, copy buttons, downloads |
| `window.copyText(text, done)` | `14-feedback.js` | the form, the Discord sticker |

`14-feedback.js` loads last but defines two of those. That is fine — nothing
calls them until a visitor clicks something, long after every file has run.

## The two inline scripts

These stay in `index.html` on purpose. Moving them to `scripts/` would break
them:

1. **The theme setter**, in `<head>`. It sets `data-theme` before first paint.
   As a deferred external file it would run *after* paint, and the page would
   flash the wrong palette on every load.
2. **The loading curtain controller**, at the top of `<body>`. It adds the `js`
   class that makes the curtain visible at all, and it arms the timeout that
   guarantees the curtain lifts. Both have to happen before anything else can
   fail. A deferred file cannot promise that.

## Why the HTML is still one file

There is no way to include one HTML file inside another without a build step or
a server that supports includes. Splitting the markup would mean adding a
toolchain — a `npm install`, a build command, a thing that can break between
you and your own site. At ~890 lines the markup is navigable, so the trade is
not worth it. If this ever grows enough to need it, that is the moment to
reach for a static site generator, not before.

## Why 404.html repeats itself

It has its own copy of the tokens and its own inline styles instead of linking
`styles/`. That is deliberate: a 404 is served for *any* URL at *any* depth, so
`styles/01-tokens.css` would resolve relative to a path that does not exist and
the page would arrive unstyled. A standalone file always renders.

## Deploying

Vercel, static, no framework preset. Two things matter:

- **This folder must be the deploy root.** Set Root Directory to `v3` if the
  repo root is the project. Otherwise the asset paths and the 404 links break.
- `404.html` at the root is picked up automatically for unmatched routes.
