import { z } from "zod";
import { SessionStatusEnum } from "./piorch-shared.js";

export const PiOrchSessionSchema = z.object({
  session_id: z.string().min(1),
  status: SessionStatusEnum,
  started_at: z.string().datetime(),
  elapsed_seconds: z.number(),
  container_id: z.string().optional(),
});
export type PiOrchSession = z.infer<typeof PiOrchSessionSchema>;

export const PiOrchSessionListResponseSchema = z.array(PiOrchSessionSchema);
export type PiOrchSessionListResponse = z.infer<
  typeof PiOrchSessionListResponseSchema
>;
