import { z } from "zod";

export const FunnelSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().optional(),
  favicon: z.string().optional(),
  subDomainName: z.string().optional(),
});

export type FunnelValidator = z.infer<typeof FunnelSchema>;
