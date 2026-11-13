# ATS Resume Optimizer

Upload a resume (PDF) and paste a job description to see which of the job's skills
your resume covers, which are missing, and an ATS-style match score.

> **Status:** under active development. Skills are extracted by Google Gemini combined with a
> rule engine, and scored by deterministic code (Phases 1 and 2). See [docs/ROADMAP.md](docs/ROADMAP.md).

## Tech stack

- **Frontend:** Next.js 16, React 19, TypeScript, TailwindCSS, framer-motion, react-hook-form + zod, Storybook
- **Backend:** NestJS 11, TypeScript, Multer, unpdf, Google Gemini (`@google/genai`), zod, `@nestjs/throttler`, Prisma (schema only, not wired yet)
- **Frontend extras:** pdf.js for the in-page resume preview
- **Testing:** Vitest + Testing Library (frontend), Jest (backend)

## How it works today

1. The upload is validated: PDF only (checked by content, not just file type), at most 5 MB,
   with readable text; the job description must be non-empty and at most 10,000 characters
2. The resume PDF is parsed to text with `unpdf`
3. Skills are extracted from the resume and the job description, as ids from a categorized list
   of about 70 skills:
   - **Google Gemini** (Flash-Lite, free tier) reads both texts in one request and picks skills
     from the list, including ones written in Turkish or Dutch ("birim test", "continue integratie").
     Email addresses, phone numbers and links are removed before sending; nothing is stored.
   - The **rule engine** matches skill names and aliases (`React.js`, `k8s`, `Mongo DB`, and common
     Turkish and Dutch terms such as "sürekli entegrasyon" or "testautomatisering") with
     word-boundary-aware patterns. Its results are added to Gemini's, because the model now and
     then skips a plainly named skill.
   - Without `GEMINI_API_KEY`, or when Gemini fails, times out, or the daily AI limit is reached,
     the rule engine is used alone. The report says which one read the texts.
4. Each job skill is matched against the resume: `exact` (full credit) or `partial` (70%) when a
   resume skill implies it, e.g. Next.js implies React. A skill counts once however often it is mentioned
5. The score is the share of the job's skills the resume covers (0-100)

Abuse protection: 5 analyses per minute and 30 per hour per client IP, at most 200 Gemini calls
per day for the whole server, and a cache so the same texts do not call Gemini again.

## Getting started

The quickest way: one command starts both apps (installs dependencies on first run).

```bash
./dev.sh                 # backend http://localhost:3001, frontend http://localhost:3000; Ctrl+C stops both
```

Gemini is optional. To use it, create a free API key at [Google AI Studio](https://aistudio.google.com)
and put it in `backend/.env` as `GEMINI_API_KEY=...` (see `backend/.env.example`). Do not enable
billing on that Google project: on the free tier a used-up quota just falls back to the rule engine.
Never commit the key; `.env` is gitignored.

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
cd backend && npm run eval:extraction   # rules vs Gemini on the text fixtures (5 real Gemini calls)
cd frontend && npm test              # Vitest unit tests (jsdom)
cd frontend && npm run test:storybook   # Storybook browser tests, needs: npx playwright install chromium
```

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md).
