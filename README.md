## top of mind

Personal relationship memory, built on voice notes and AI extraction.

You drop in short notes (typed or audio), and the app:

- **Transcribes** audio with Deepgram
- **Extracts** people, commitments, and personal details with Google Gemini
- **Stores** everything in Postgres via Drizzle
- **Surfaces**:
  - a feed of notes (with audio playback)
  - a searchable memory layer
  - a lightweight “your network” view for people

---

## Tech stack

- **Framework**: Next.js App Router (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind v4, custom components, motion
- **Data**:
  - Postgres (Supabase) with Drizzle ORM + migrations
  - Vector embeddings (Google text-embedding-004 / `gemini-embedding-001`)
- **AI**:
  - Google Generative AI (Gemini 2.5 / 2.0 flash)
  - Deepgram for transcription
- **Storage**:
  - Supabase S3-compatible bucket for audio
- **Data fetching**:
  - Next.js API routes
  - TanStack Query for client-side caching

---

## Local development

### 1. Install dependencies

This repo uses Bun by default, but any package manager works.

```bash
# with bun (recommended)
bun install

# or
npm install
```

### 2. Environment variables

Copy the example env file and fill in your own keys:

```bash
cp .env.example .env
```

Then edit `.env` and set:

- **Google**: `GOOGLE_GENERATIVE_AI_API_KEY`
- **Database**: `DATABASE_URL` (Postgres with `schema=topofmind`)
- **Deepgram**: `DEEPGRAM_API_KEY`
- **Storage**:
  - `S3_ENDPOINT`
  - `BUCKET_NAME`
  - `NEXT_PUBLIC_STORAGE_PUBLIC_URL`
  - `S3_ACCESS_KEY_ID`
  - `S3_SECRET_ACCESS_KEY`

> **Important:** never commit your real `.env` to git. Only `.env.example` should be versioned.

### 3. Database & migrations

This project uses Drizzle for schema + migrations.

Run migrations against your Postgres instance:

```bash
# generate SQL from schemas (optional if already generated)
bun drizzle-kit generate

# apply migrations
bun drizzle-kit migrate
```

If you prefer the provided scripts:

```bash
# generate migration files
bun db:generate

# apply migrations
bun db:migrate
```

Make sure your `DATABASE_URL` in `.env` points at a database where you’re happy to create the `topofmind` schema.

### 4. Start the dev server

```bash
bun dev
```

Then open `http://localhost:3000` in your browser.

---

## Project structure (high level)

- `app/`
  - `page.tsx` – main note-taking + results layout
  - `people/` – “your network” list and person detail pages
  - `api/`
    - `agent/route.ts` – AI processing pipeline for notes
    - `notes/route.ts` & `[id]/route.ts` – notes list + delete
    - `people/route.ts` & `[id]/route.ts` – people list + detail
    - `search/route.ts` – semantic + fuzzy search
    - `briefing/route.ts` – pre‑meeting briefings
- `components/`
  - `note-feed.tsx` – notes list + audio player + delete dialog
  - `search-bar.tsx` – global search
  - `results.tsx` – latest agent extraction
  - `ui/` – button, card, dialog, etc.
- `hooks/`
  - `agent/` – process note, latest result
  - `notes/` – list + delete notes
  - `people/` – person detail + toggle commitments
  - `briefing/` – generate briefings
- `drizzle/`
  - `schema/` – typed Postgres schema for notes, people, links, embeddings
  - `migrations/` – SQL migration files
- `services/`
  - thin, typed API clients (`agent.api.ts`, `notes.api.ts`, etc.)

---

## Running in production

### Vercel

The app is designed to run cleanly on Vercel:

1. Push this repo to GitHub.
2. Create a new Vercel project from the repo.
3. In the Vercel project **Environment Variables** tab, add all keys from `.env.example`.
4. Ensure your database and storage (Supabase) are reachable from Vercel.

Vercel will:

- install dependencies
- run the Next.js build
- deploy the App Router site

### Other platforms

You can also run the built app anywhere Node 18+ is available:

```bash
bun run build
bun run start
```

Just make sure the same env vars you used locally are present in your runtime environment.

---

## Notes & conventions

- **Types first**: Zod validators live under `validators/` and drive the shapes we expect in services and hooks. 
- **Query keys**: TanStack Query keys are centralized in `lib/tanstack/query-keys.ts`. Don’t hardcode arrays.
- **Env safety**: use `.env.example` as the source of truth for what needs to be configured.

 