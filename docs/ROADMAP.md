# ATS Resume Optimizer: Improvement Roadmap

Goal: turn the project into an honest, production-shaped **AI-assisted resume/job-fit analyzer**
where an LLM handles unstructured extraction and deterministic code handles scoring.
Each phase ships as its own branch + PR with conventional commits.

## Baseline audit (Nov 2026)

| Area | Finding |
|---|---|
| AI | `openai` is a dependency but is never imported. The March AI commit was replaced by a rule-based engine. README says "AI powered feedback simulation". |
| Engine | Tokenizer splits on spaces and keeps punctuation, so `"React,"` never matches. Multi-word synonyms (`"mongo db"`) can never trigger. Empty job skill list returns `NaN`. Taxonomy is 27 hardcoded skills (no Java, Spring Boot, Python, React Native). |
| Backend | PDF parsing and orchestration live in the controller. No file type/size validation. Debug `console.log`s. Port and CORS hardcoded. `AnalysisService.analyzeKeywords` is dead code. Prisma schema exists but is not wired. Only default "should be defined" tests. |
| Frontend | `tsc` fails: `axios` imported but not installed, empty `app/test-form/page.tsx`. API URL hardcoded. Zustand store, `useResumeAnalysis`, `mockApi`, `SkeletonLoader` are not used by the real page. `any` in result handling. |
| Tests | Vitest config only runs the Storybook browser project, so the unit tests in `__tests__/` never run. Playwright `testDir` points to a non-existent root folder and the spec targets `localhost:3001/test-form` (backend port, empty page). |
| Repo | 340 files of `frontend/.next/` build output and `test-results/` are committed. README lists Next 13 / React 18; actual versions are Next 16 / React 19. |

## Phase 0: Baseline and hygiene
- Remove committed build output and test artifacts; fix `.gitignore`
- Remove dead code (`TestAnalysis`, `ATSAnalyzer`, empty `test-form`, mock API, unused hooks, Storybook boilerplate) and unused deps (`openai`, `pdf-parse`)
- Make frontend `tsc` pass
- Split Vitest into a `unit` project (jsdom) and the existing `storybook` project, so unit tests actually run; fix the tests that were failing silently
- Remove the broken Playwright spec (rebuilt properly in Phase 5)
- Config via env: `PORT`, `CORS_ORIGIN`, `NEXT_PUBLIC_API_URL`
- Replace `console.log` with Nest `Logger`; apply Prettier to backend in a formatting-only commit
- README: correct tech stack, honest feature list
- Remaining: 4 `no-explicit-any` lint errors tied to the untyped API response, fixed in Phase 1 with a typed response contract

## Phase 1: Solid deterministic engine (the baseline and fallback)
- Move orchestration into `AnalysisService`; controller stays thin
- Upload validation: PDF only, size limit, readable text check
- Tokenizer that handles punctuation and multi-word skills (`spring boot`, `react native`)
- Expand taxonomy into a typed, categorized skill map with aliases
- Guard empty inputs; typed response DTO
- Unit tests for tokenizer, extractor, matcher, scorer with real job-ad fixtures

## Phase 2: LLM integration (the "AI automation" core)
- `LlmClient` interface behind a Nest provider, so the vendor is swappable and mockable
- Structured output validated with a zod schema; invalid output is rejected, not trusted
- Hybrid design: LLM extracts skills/requirements, deterministic code scores them
- Fallback to the Phase 1 engine on timeout, error or invalid output
- Timeouts, retries with backoff, `@nestjs/throttler`, input truncation, cache by content hash
- Prompts versioned in files
- Small eval set: fixtures with expected skills, compare rule-based vs LLM precision/recall

## Phase 3: Job-fit analysis
- Must-have vs nice-to-have weighting
- Seniority / years required vs candidate level
- Language requirements (e.g. Dutch) surfaced explicitly
- Tailored resume suggestions with a guardrail: never invent experience the resume does not contain

## Phase 4: Batch automation
- Analyze multiple job descriptions in one run, ranked comparison view
- Async processing with job status polling
- Persist analysis history with Prisma
- Export results (CSV)
- Human in the loop: the tool analyzes and suggests, the user decides and applies

## Phase 5: Frontend integration
- Real API client with React Query mutation, typed results, Zustand only where shared state is needed
- Result view: score breakdown, matched/missing by category, suggestions
- Playwright E2E against a mocked API

## Phase 6: Ship
- GitHub Actions CI: lint, typecheck, unit tests, E2E
- Docker Compose for local dev (frontend, backend, Postgres)
- Deploy frontend and backend
- README with architecture diagram and short decision records (why hybrid, why fallback, why zod)
