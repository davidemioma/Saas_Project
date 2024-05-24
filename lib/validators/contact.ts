import { z } from "zod";

export const ContactSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().min(1, { message: "Email is required." }),
});

export type ContactValidator = z.infer<typeof ContactSchema>;
