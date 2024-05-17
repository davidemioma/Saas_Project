import { z } from "zod";

export const InvitationSchema = z.object({
  email: z.string().email(),
  role: z.enum(["AGENCY_ADMIN", "SUBACCOUNT_USER", "SUBACCOUNT_GUEST"]),
});

export type InvitationValidator = z.infer<typeof InvitationSchema>;
