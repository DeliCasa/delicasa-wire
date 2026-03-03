import { z } from "zod";

export const LocationDomain = z.object({
  address: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export type LocationDomain = z.infer<typeof LocationDomain>;

export const ControllerDomain = z.object({
  id: z.string().uuid(),
  displayName: z.string().min(1).max(50),
  status: z.enum(["online", "offline", "maintenance"]),
  location: LocationDomain.optional(),
});

export type ControllerDomain = z.infer<typeof ControllerDomain>;
