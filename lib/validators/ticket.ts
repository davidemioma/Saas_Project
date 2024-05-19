import { z } from "zod";

export const TicketSchema = z.object({
  name: z.string().min(1, { message: "Ticket name is required" }),
  description: z.string().min(1, { message: "Ticket description is required" }),
  value: z.coerce.number().min(1, { message: "Ticket value is required" }),
  assignedUserId: z.string(),
  customerId: z.string(),
});

export type TicketValidator = z.infer<typeof TicketSchema>;
