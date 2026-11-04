# ATS Resume Optimizer

Upload a resume (PDF) and paste a job description to see which of the job's skills
your resume covers, which are missing, and an ATS-style match score.

> **Status:** under active development. The current engine is rule-based.
> LLM-based extraction with a deterministic scoring layer and rule-based fallback is
> planned next. See [docs/ROADMAP.md](docs/ROADMAP.md).

## Tech stack

- **Frontend:** Next.js 16, React 19, TypeScript, TailwindCSS, framer-motion, react-hook-form + zod, Storybook
- **Backend:** NestJS 11, TypeScript, Multer, unpdf, Prisma (schema only, not wired yet)
- **Testing:** Vitest + Testing Library (frontend), Jest (backend)

## How it works today

1. The resume PDF is parsed to text with `unpdf`
2. Skills are extracted from the resume and the job description against a skill list with aliases
3. Each job skill is matched against the resume as `exact`, `synonym` or `partial`
4. The weighted match ratio becomes the score

## Getting started

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
cd backend && npm test               # Jest
cd frontend && npm test              # Vitest unit tests (jsdom)
cd frontend && npm run test:storybook   # Storybook browser tests, needs: npx playwright install chromium
```

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md).
