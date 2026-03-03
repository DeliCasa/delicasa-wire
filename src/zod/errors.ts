import { z } from "zod";

export const ErrorDomain = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  details: z.record(z.string()).optional(),
});

export type ErrorDomain = z.infer<typeof ErrorDomain>;
