import { z } from "zod";

export const AgencySchema = z.object({
  name: z.string().min(2, { message: "Agency name must be at least 2 chars." }),
  companyEmail: z.string().min(1, { message: "Email is required." }),
  companyPhone: z.string().min(1, { message: "Company number is required." }),
  whiteLabel: z.boolean(),
  address: z.string().min(1, { message: "Address is required." }),
  city: z.string().min(1, { message: "City is required." }),
  zipCode: z.string().min(1, { message: "Zip code is required." }),
  state: z.string().min(1, { message: "State is required." }),
  country: z.string().min(1, { message: "Country is required." }),
  agencyLogo: z.string().min(1, { message: "A logo is required." }),
});

export type AgencyValidator = z.infer<typeof AgencySchema>;
