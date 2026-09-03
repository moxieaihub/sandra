import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const createInput = z.object({
  amountNaira: z.number().positive(),
  reference: z.string().min(1),
  description: z.string().min(1),
  redirectUrl: z.string().url(),
  metadata: z.record(z.unknown()),
});

export const createZapCheckoutFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createInput.parse(data))
  .handler(async ({ data }) => {
    const { createZapCheckout } = await import("./zap-pay.server");
    return createZapCheckout(data);
  });

const finalizeInput = z.object({
  registrationId: z.string().uuid(),
  reference: z.string().min(1),
});

export const finalizeZapCheckoutFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => finalizeInput.parse(data))
  .handler(async ({ data }) => {
    const { finalizeZapCheckout } = await import("./zap-pay.server");
    return finalizeZapCheckout(data);
  });