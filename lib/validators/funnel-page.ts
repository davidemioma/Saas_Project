import { z } from "zod";

export const FunnelPageSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  pathName: z.string().optional(),
});

export type FunnelPageValidator = z.infer<typeof FunnelPageSchema>;
