# ATS Resume Optimizer

Upload a resume (PDF) and paste a job description to see which of the job's skills
your resume covers, which are missing, and an ATS-style match score.

> **Status:** under active development. The current engine is rule-based (Phase 1 done).
> LLM-based extraction with a deterministic scoring layer and rule-based fallback is
> planned next. See [docs/ROADMAP.md](docs/ROADMAP.md).

## Tech stack

- **Frontend:** Next.js 16, React 19, TypeScript, TailwindCSS, framer-motion, react-hook-form + zod, Storybook
- **Backend:** NestJS 11, TypeScript, Multer, unpdf, Prisma (schema only, not wired yet)
- **Testing:** Vitest + Testing Library (frontend), Jest (backend)

## How it works today

1. The upload is validated: PDF only (checked by content, not just file type), at most 5 MB,
   with readable text; the job description must be non-empty and at most 10,000 characters
2. The resume PDF is parsed to text with `unpdf`
3. Skills are extracted from the resume and the job description using a categorized list of
   about 70 skills with aliases (`React.js`, `k8s`, `Mongo DB`). Matching respects word
   boundaries, so punctuation and English, Dutch or Turkish text around skill names work
4. Each job skill is matched against the resume: `exact` (full credit) or `partial` (70%) when a
   resume skill implies it, e.g. Next.js implies React. A skill counts once however often it is mentioned
5. The score is the share of the job's skills the resume covers (0-100)

## Getting started

The quickest way: one command starts both apps (installs dependencies on first run).

```bash
./dev.sh                 # backend http://localhost:3001, frontend http://localhost:3000; Ctrl+C stops both
```

Or start them separately:

```bash
# backend
cd backend
cp .env.example .env
npm install
npm run start:dev        # http://localhost:3001

# frontend
cd frontend
cp .env.example .env.local
npm install
npm run dev              # http://localhost:3000
```

## Testing

```bash
./dev.sh --check                     # all tests, lint and typecheck, then start the apps
cd backend && npm test               # Jest
cd frontend && npm test              # Vitest unit tests (jsdom)
cd frontend && npm run test:storybook   # Storybook browser tests, needs: npx playwright install chromium
```

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md).
