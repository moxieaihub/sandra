import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const verifyInput = z.object({
  registrationId: z.string().uuid(),
  reference: z.string().min(1),
});

export const verifyEnrolmentPayment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => verifyInput.parse(data))
  .handler(async ({ data }) => {
    const { verifyPayment } = await import("./enrolment.server");
    return verifyPayment(data);
  });
