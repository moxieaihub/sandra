import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const createRegistrationInput = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  phoneCountryCode: z.string().nullable(),
  phoneNational: z.string(),
  phoneE164: z.string(),
  country: z.string().nullable(),
  countryCode: z.string().nullable(),
  state: z.string().min(1),
  city: z.string().nullable(),
  category: z.string().min(1),
  tierId: z.string().min(1),
  heardFrom: z.string().min(1),
});

export const createRegistrationFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createRegistrationInput.parse(data))
  .handler(async ({ data }) => {
    const { createRegistration } = await import("./registration.server");
    return createRegistration(data);
  });