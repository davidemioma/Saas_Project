import { z } from "zod";

export const MediaSchema = z.object({
  link: z.string().min(1, { message: "Media File is required" }),
  name: z.string().min(1, { message: "Name is required" }),
});

export type MediaValidator = z.infer<typeof MediaSchema>;
