import { z } from "zod";

export const FunnelPageSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  pathName: z.string().min(1, {
    message:
      "Pages other than the first page in the funnel require a path name example 'secondstep",
  }),
});

export type FunnelPageValidator = z.infer<typeof FunnelPageSchema>;
