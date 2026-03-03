import { z } from "zod";

export const PurchaseItemDomain = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  containerId: z.string().min(1),
});

export type PurchaseItemDomain = z.infer<typeof PurchaseItemDomain>;

export const PurchaseSessionDomain = z.object({
  id: z.string().uuid(),
  controllerId: z.string().uuid(),
  status: z.enum(["active", "completed", "expired", "cancelled"]),
  items: z.array(PurchaseItemDomain),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
});

export type PurchaseSessionDomain = z.infer<typeof PurchaseSessionDomain>;
