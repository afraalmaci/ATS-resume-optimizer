"use client";

import type { AnalysisResponse, SkillInfo } from "@/types/analysis";

export type ResultState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "done"; result: AnalysisResponse };

/**
 * The output side of the instrument: same panel style as the inputs, with a
 * poster-like layout (one huge number, then the skills in three columns).
 */
export default function ResultPanel({ state }: { state: ResultState }) {
  return (
    <section
      aria-label="Report"
      className="flex min-h-[32rem] flex-col border border-rule bg-panel p-5 sm:p-6"
    >
      {state.kind === "idle" && <Idle />}
      {state.kind === "loading" && <Loading />}
      {state.kind === "error" && <ErrorReport message={state.message} />}
      {state.kind === "done" && <Report result={state.result} />}
    </section>
  );
}

function PanelHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em]">
      <span className="border border-rule px-1.5 py-0.5 text-dim">Out</span>
      <span className="font-medium">{children}</span>
    </div>
  );
}

function BigNumber({ value, dim = false }: { value: string; dim?: boolean }) {
  return (
    <div className="flex items-end gap-3">
      <span
        className={
          "font-display text-[clamp(7rem,20vw,12rem)] font-bold leading-[0.8] tracking-tight tabular-nums " +
          (dim ? "text-rule" : "text-ink")
        }
      >
        {value}
      </span>
      <span className="mb-2 font-display text-2xl font-medium text-dim">/100</span>
    </div>
  );
}

function Idle() {
  return (
    <div className="flex flex-1 flex-col justify-between gap-8">
      <PanelHeader>Coverage · awaiting input</PanelHeader>
      <div aria-hidden>
        <BigNumber value="00" dim />
      </div>
      <p className="max-w-sm text-sm text-dim">
        Load a resume and a job ad, then run the analysis. The report shows how
        much of the job&apos;s skill list the resume covers.
      </p>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex flex-1 flex-col justify-between gap-8">
      <PanelHeader>
        Coverage · measuring<span className="animate-blink">_</span>
      </PanelHeader>
      <div className="relative h-40 overflow-hidden border-y border-rule">
        <div className="animate-scan absolute inset-x-0 h-1/4 bg-amber/15" />
      </div>
      <p className="text-sm text-dim">Reading both texts and matching skills.</p>
    </div>
  );
}

function ErrorReport({ message }: { message: string }) {
  return (
    <div className="flex flex-1 flex-col justify-between gap-8">
      <PanelHeader>Coverage · no reading</PanelHeader>
      <div role="alert" className="border-l-4 border-red pl-4">
        <p className="font-display text-3xl font-bold uppercase text-red">
          Could not analyze
        </p>
        <p className="mt-2 text-sm">{message}</p>
      </div>
      <p className="text-sm text-dim">Fix the input and run again.</p>
    </div>
  );
}

function Report({ result }: { result: AnalysisResponse }) {
  const info = (id: string): SkillInfo =>
    result.skills[id] ?? { label: id, category: "practice" };

  const matched = result.matches.filter((m) => m.matchType === "exact");
  const partial = result.matches.filter(
    (m) => m.matchType === "partial" || m.matchType === "synonym",
  );
  const missing = result.matches.filter((m) => m.matchType === "missing");
  const extra = result.resumeSkills.filter((s) => !result.jobSkills.includes(s));
  const total = result.matches.length || 1;
  const share = (n: number) => `${(n / total) * 100}%`;

  return (
    <div className="flex flex-1 flex-col gap-8">
      <PanelHeader>Coverage of job skills</PanelHeader>

      <div>
        <BigNumber value={String(result.score)} />
        {/* Matched, partial and missing as one bar, in proportion. */}
        <div className="mt-6 flex h-2.5 w-full bg-panel-raised" aria-hidden>
          <div className="bg-ok" style={{ width: share(matched.length) }} />
          <div className="bg-hatch" style={{ width: share(partial.length) }} />
          <div className="bg-red" style={{ width: share(missing.length) }} />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <SkillGroup
          title="Matched"
          ids={matched.map((m) => m.skill)}
          info={info}
          accent="border-ok"
        />
        <SkillGroup
          title="Partial"
          note="A related skill on the resume (70%)"
          ids={partial.map((m) => m.skill)}
          info={info}
          accent="border-amber"
        />
        <SkillGroup
          title="Missing"
          ids={missing.map((m) => m.skill)}
          info={info}
          accent="border-red"
          missing
        />
      </div>

      {extra.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-[0.2em] text-dim">
            Also on the resume, not asked for
          </h3>
          <p className="mt-2 text-sm">
            {extra.map((id) => info(id).label).join(" · ")}
          </p>
        </div>
      )}

      <p className="mt-auto border-t border-rule pt-3 text-xs uppercase tracking-[0.2em] text-dim">
        Read by{" "}
        {result.source === "ai"
          ? "Google Gemini"
          : "the rule engine (AI unavailable)"}
      </p>
    </div>
  );
}

function SkillGroup({
  title,
  note,
  ids,
  info,
  accent,
  missing = false,
}: {
  title: string;
  note?: string;
  ids: string[];
  info: (id: string) => SkillInfo;
  accent: string;
  missing?: boolean;
}) {
  return (
    <section aria-label={title} className={`border-t-4 pt-3 ${accent}`}>
      <h3 className="flex items-baseline justify-between font-display text-lg font-bold uppercase tracking-wide">
        <span className={missing ? "text-red" : undefined}>{title}</span>
        <span className="tabular-nums text-dim">
          {String(ids.length).padStart(2, "0")}
        </span>
      </h3>
      {note && <p className="mt-1 text-xs text-dim">{note}</p>}
      {ids.length === 0 ? (
        <p className="mt-3 text-sm text-dim">None</p>
      ) : (
        <ul className="mt-3 space-y-1.5">
          {ids.map((id) => {
            const skill = info(id);
            return (
              <li key={id} className="flex items-baseline justify-between gap-2">
                <span
                  className={
                    "font-display text-lg font-medium " +
                    (missing ? "text-red" : "text-ink")
                  }
                >
                  {skill.label}
                </span>
                <span className="text-[0.65rem] uppercase tracking-widest text-dim">
                  {skill.category}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
