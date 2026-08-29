# James Magpantay — Portfolio

A cybersecurity portfolio built as a three-layer console: a SOC-style shell for
navigation, an interactive network topology as the homepage, and (coming in a
later phase) a terminal for anyone who wants to dig.

Live: _not deployed yet — see "Deploying" below._

---

## Updating the site without writing code

**Everything you'd want to change lives in `lib/content/`.** Edit the data, not
the components. The pages rebuild themselves around whatever you put there.

| What you want to change            | File                             |
| ---------------------------------- | -------------------------------- |
| Name, bio, email, socials, photo   | `lib/content/profile.ts`         |
| Jobs, internships, org positions   | `lib/content/experience.ts`      |
| Projects                           | `lib/content/projects.ts`        |
| Certifications                     | `lib/content/certifications.ts`  |
| Hackathons, CTFs, workshops        | `lib/content/events.ts`          |
| Hobbies and personal section       | `lib/content/personal.ts`        |
| Education, skills, awards          | `lib/content/profile.ts`         |

### Adding a writeup

1. Copy `content/writeups/_TEMPLATE.mdx.txt`
2. Rename it to `your-slug.mdx` — the filename becomes the URL
3. Fill in the frontmatter at the top, write the body in Markdown
4. Commit and push

Full details in `content/writeups/README.md`.

### Adding event photos

Drop image files into `public/events/`, then list them in the `photos` array of
the matching event in `lib/content/events.ts`:

```ts
photos: ["/events/codekada-1.jpg", "/events/codekada-2.jpg"],
```

The placeholder frame disappears automatically once photos are listed.

### The personal section

`lib/content/personal.ts` currently holds **placeholders**, and the page openly
says so rather than presenting invented facts. Replace the entries with real
ones and set `confirmed: true` on each — the warning banner removes itself.

---

## Running it locally

```bash
npm install     # first time only
npm run dev     # http://localhost:3000
```

Other commands:

```bash
npm run build   # production build — run this before pushing if unsure
npm start       # serve the production build locally
npm run lint    # check code style
```

---

## Deploying

Free, permanently, on Vercel:

1. Push this repository to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo
3. Accept every default — Next.js is detected automatically
4. Deploy

Every push to `main` redeploys. Every pull request gets its own preview URL, so
you can look at a change before it goes live.

When you have the final subdomain, update these three places so links and SEO
point at the right host:

- `app/layout.tsx` — `metadataBase`
- `app/sitemap.ts` — `BASE`
- `app/robots.ts` — the `sitemap` URL

---

## Stack

| Layer     | Choice                                        |
| --------- | --------------------------------------------- |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling   | Tailwind CSS v4, tokens in `app/globals.css`  |
| Topology  | React Flow (`@xyflow/react`)                   |
| Motion    | Motion (Framer Motion)                         |
| Content   | MDX via `next-mdx-remote`, Shiki highlighting  |
| Icons     | lucide-react, brand marks inline               |
| Hosting   | Vercel (free tier)                             |

All 13 routes are prerendered as static HTML at build time.

---

## Design system

Tokens are defined once in `app/globals.css` under `@theme`, and every component
reads from them. If you want to change the look, change the tokens.

| Token                | Value     | Used for                          |
| -------------------- | --------- | --------------------------------- |
| `--color-bg`         | `#0B1220` | Page ground                       |
| `--color-panel`      | `#131C2E` | Panel surfaces                    |
| `--color-line`       | `#1E2B44` | Borders and hairlines             |
| `--color-accent`     | `#22D3EE` | Links, active state, packets      |
| `--color-ok/warn/crit` | —       | Status only, never decoration     |

Typography is the IBM Plex superfamily: Condensed for headings, Sans for body,
Mono for data and hostnames.

---

## Build status

| Phase | Scope                                       | State    |
| ----- | ------------------------------------------- | -------- |
| P0    | Scaffold, tokens, deploy pipeline           | Done     |
| P1    | Console shell, nav rail, mobile, a11y base  | Done     |
| P2    | Interactive topology, packet flow, log feed | Done     |
| P3    | About, projects, experience, certs, events  | Done     |
| P4    | Writeups MDX pipeline                       | Done     |
| P5    | Terminal palette and easter eggs            | Pending  |
| P6    | CSP, security.txt, PGP, recon page          | Pending  |
| P7    | Lighthouse, OG cards, launch polish         | Pending  |

Baseline security headers (HSTS, nosniff, frame-deny, referrer policy,
permissions policy) are already live in `next.config.ts`. The full CSP needs
per-request nonces via middleware and lands in P6.
