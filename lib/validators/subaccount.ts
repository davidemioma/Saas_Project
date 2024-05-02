import { z } from "zod";

export const SubAccountSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Sub account name must be at least 2 chars." }),
  companyEmail: z.string().min(1, { message: "Email is required." }),
  companyPhone: z.string().min(1, { message: "Company number is required." }),
  address: z.string().min(1, { message: "Address is required." }),
  city: z.string().min(1, { message: "City is required." }),
  zipCode: z.string().min(1, { message: "Zip code is required." }),
  state: z.string().min(1, { message: "State is required." }),
  country: z.string().min(1, { message: "Country is required." }),
  subAccountLogo: z.string().min(1, { message: "A logo is required." }),
});

export type SubAccountValidator = z.infer<typeof SubAccountSchema>;
