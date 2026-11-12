import { z } from "zod"

export const resumeSchema = z.object({
  resume: z
    .instanceof(File)
    .refine((file) => file.type === "application/pdf", {
      message: "Resume must be a PDF file",
    })
    .refine((file) => file.size < 5 * 1024 * 1024, {
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