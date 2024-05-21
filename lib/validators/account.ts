import { z } from "zod";

export const AccountSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum([
    "AGENCY_OWNER",
    "AGENCY_ADMIN",
    "SUBACCOUNT_USER",
    "SUBACCOUNT_GUEST",
  ]),
});

export type AccountValidator = z.infer<typeof AccountSchema>;
