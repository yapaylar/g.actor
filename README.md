# g-world

The home for the team's projects. Every initiative — `G-ACT`, `V-loop`, `Heartlink`, `Social` — lives as a card on one screen. Open a card to follow progress, drop notes, and send the team a notification.

Built as a clean, fast web app (works great on desktop and mobile, and can be installed to the home screen like an app).

## Tech

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- Data is stored **locally in the browser** (`localStorage`) for now — no login, no setup, instant to use.

## Run it

```bash
npm install
npm run dev
```

Then open the URL it prints (e.g. `http://localhost:3000`).

## What it does today

- **Dashboard** — all projects as floating glass spheres, plus a `+ New project` card.
- **World view** — toggle to an orbital map: every project orbits the g-world sphere. Hover to pause, click to enter.
- **Command palette** — press `⌘K` anywhere to search projects, updates, and notes, or run quick actions.
- **Dark mode** — toggle in the top bar; follows your system preference by default.
- **Project view** — overview, an **Updates** timeline (update / milestone / release / blocker), and **Notes & comments**.
- **Notify** — send a notification about a project; it shows up in the bell for everyone.
- **Team chat** — a per-project chat panel on the right for the team to talk, with a pinned **Yapaylar** teaser at the top.
- **Your name** — click the avatar (top right) to set who you are; it's used as the author on your posts.

> Tip: data lives in your browser. To start fresh, clear site data, or run `resetAll()` from `src/lib/store.ts` in the console.

## Roadmap

1. **Real team sharing** — add accounts + a shared database (e.g. Supabase) so everyone sees the same data and gets real notifications.
2. **Yapaylar** (future AI) — AI teammates that live pinned at the top of each project's chat.
   - Each person gets their **own** assistant, **trained on that project** (its updates, notes, files).
   - Pick one of three models per conversation: **GPT**, **Claude**, or **Gemini**.
   - For now it's a teaser only; the real team chat ships first.
3. **Install as an app** — PWA polish (icon, offline, "Add to home screen").

## Project structure

```
src/
  app/
    page.tsx                  # dashboard route
    project/[id]/page.tsx     # project route
    layout.tsx, globals.css
  components/                 # UI (cards, panels, composers, chat)
  lib/
    types.ts                  # data model
    store.ts                  # localStorage store + mutations
    identity.ts               # current user's name
    util.ts                   # helpers (time, colors)
```
