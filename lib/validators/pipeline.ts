import { z } from "zod";

export const PipelineSchema = z.object({
  name: z.string().min(1, { message: "Pipeline name is required" }),
});

export type PipelineValidator = z.infer<typeof PipelineSchema>;
