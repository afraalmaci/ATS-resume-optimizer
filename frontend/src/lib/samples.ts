// Fictional samples, so people can try the app without uploading their own
// resume. The resume PDF lives in public/; it was generated from plain text
// with backend/test/fixtures/make-pdf.ts.

export const SAMPLE_RESUME_URL = "/sample-resume.pdf";
export const SAMPLE_RESUME_NAME = "sample-resume.pdf";

export async function loadSampleResume(): Promise<File> {
  const res = await fetch(SAMPLE_RESUME_URL);
  if (!res.ok) {
    throw new Error("Could not load the sample resume");
  }
  const blob = await res.blob();
  return new File([blob], SAMPLE_RESUME_NAME, { type: "application/pdf" });
}

export const SAMPLE_JOB_DESCRIPTION = `Medior Frontend Developer (fictional sample job ad)

About the role
You will build the customer dashboard of a growing SaaS product with React and TypeScript, together with designers and backend developers.

Requirements
- 3+ years of experience with React and TypeScript
- Experience with state management (Redux or similar)
- Comfortable working with REST APIs and GraphQL
- Experience with automated testing (Jest, Cypress)
- Familiar with Git and CI/CD pipelines

Nice to have
Next.js, Docker, AWS

We offer
A hybrid work model, a learning budget and an Agile team that ships every week.`;
