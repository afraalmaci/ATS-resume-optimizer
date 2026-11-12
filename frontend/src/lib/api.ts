import { API_URL } from "@/lib/config";
import type { AnalysisResponse } from "@/types/analysis";

/**
 * Sends the resume and job description to the backend.
 * On an error response, throws with the server's message so the user sees
 * why it failed (e.g. "Resume must be a PDF file").
 */
export async function analyzeResume(
  resume: File,
  jobDescription: string,
): Promise<AnalysisResponse> {
  const formData = new FormData();
  formData.append("resume", resume);
  formData.append("jobDescription", jobDescription);

  const res = await fetch(`${API_URL}/analysis`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const body: unknown = await res.json().catch(() => null);
    throw new Error(serverMessage(body) ?? `Analysis failed (${res.status})`);
  }

  return (await res.json()) as AnalysisResponse;
}

// Nest sends { message: string } or, for validation errors, { message: string[] }.
function serverMessage(body: unknown): string | null {
  if (typeof body !== "object" || body === null || !("message" in body)) {
    return null;
  }
  const { message } = body;
  if (typeof message === "string") return message;
  if (Array.isArray(message)) return message.join(", ");
  return null;
}
