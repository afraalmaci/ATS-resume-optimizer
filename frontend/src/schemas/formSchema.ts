import { z } from "zod"

// Must match MAX_RESUME_BYTES in backend/src/analysis/analysis.constants.ts.
export const RESUME_MAX_BYTES = 5 * 1024 * 1024

export const resumeSchema = z.object({
  resume: z
    .instanceof(File)
    .refine((file) => file.type === "application/pdf", {
      message: "Resume must be a PDF file",
    })
    .refine((file) => file.size <= RESUME_MAX_BYTES, {
      message: "File size must be less than 5MB",
    }),
})

// Long job ads run to about 3,000-6,000 characters; 10,000 leaves room.
export const JOB_DESCRIPTION_MAX_CHARS = 10_000

export const jobDescriptionSchema = z.object({
  jobDescription: z
    .string()
    .min(50, "Job description must be at least 50 characters")
    .max(JOB_DESCRIPTION_MAX_CHARS),
})