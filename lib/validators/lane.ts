import { z } from "zod";

export const LaneSchema = z.object({
  name: z.string().min(1, { message: "Lane name is required" }),
});

export type LaneValidator = z.infer<typeof LaneSchema>;
