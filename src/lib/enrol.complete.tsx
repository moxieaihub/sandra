import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { z } from "zod";

import { finalizeZapCheckoutFn } from "@/lib/zap-pay.functions";
import { ACADEMY, formatNaira } from "@/lib/academy-content";

const searchSchema = z.object({
  registrationId: z.string(),
  reference: z.string(),
});

export const Route = createFileRoute("/enrol/complete")({
  validateSearch: searchSchema,
  component: CompletePage,
});

type Receipt = {
  reference: string;
  tierName: string;
  amountPaid: number;
  fullName: string;
  email: string;
  paidAt: string;
  whatsappLink: string;
  emailSent: boolean;
};

const REDIRECT_DELAY_MS = 3000;

function CompletePage() {
  const { registrationId, reference } = useSearch({ from: "/enrol/complete" });
  const finalize = useServerFn(finalizeZapCheckoutFn);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_DELAY_MS / 1000);

  useEffect(() => {
    let cancelled = false;
    const MAX_ATTEMPTS = 10;

    async function poll() {
      try {
        const result = await finalize({ data: { registrationId, reference } });
        if (cancelled) return;
        if (result.status === "paid") {
          setReceipt(result);
          return;
        }
        if (attempt < MAX_ATTEMPTS) {
          setTimeout(() => setAttempt((a) => a + 1), 2000);
        } else {
          setError(
            "Your payment is taking longer than usual to confirm. If you were charged, contact support with your reference and we'll sort it out.",
          );
        }
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      }
    }

    void poll();
    return () => {
      cancelled = true;
    };
  }, [attempt, registrationId, reference, finalize]);

  // Auto-redirect to WhatsApp once payment is confirmed
  useEffect(() => {
    if (!receipt?.whatsappLink) return;

    const countdown = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);

    const redirect = setTimeout(() => {
      window.location.href = receipt.whatsappLink;
    }, REDIRECT_DELAY_MS);

    return () => {
      clearInterval(countdown);
      clearTimeout(redirect);
    };
  }, [receipt]);

  if (error) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6">
        <h1 className="font-display text-3xl">Something went wrong</h1>
        <p className="mt-4 text-muted-foreground">{error}</p>
        <p className="mt-4 text-sm text-muted-foreground">
          Reference: {reference} · Contact {ACADEMY.supportEmail} / {ACADEMY.supportWhatsApp}
        </p>
      </main>
    );
  }

  if (!receipt) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-6 text-lg">Confirming your payment…</p>
        <p className="mt-2 text-sm text-muted-foreground">This usually takes a few seconds.</p>
      </main>
    );
  }

  const firstName = receipt.fullName.trim().split(/\s+/)[0];

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-16">
      <div className="rounded-lg border border-primary bg-secondary p-6 sm:p-10">
        <h1 className="font-display text-4xl text-primary">You're in.</h1>
        <p className="mt-3 text-lg">
          Welcome to {ACADEMY.name}, {firstName}.
        </p>

        {receipt.whatsappLink ? (
          <p className="mt-3 text-sm text-primary">
            Taking you to your WhatsApp community in {secondsLeft}s…
          </p>
        ) : null}

        <dl className="mt-8 grid gap-x-8 gap-y-3 border-t border-border pt-6 text-sm sm:grid-cols-2">
          {[
            ["Reference", receipt.reference],
            ["Package", receipt.tierName],
            ["Amount paid", formatNaira(receipt.amountPaid)],
            ["Date", receipt.paidAt],
            ["Name", receipt.fullName],
            ["Email", receipt.email],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="text-right font-medium">{value}</dd>
            </div>
          ))}
        </dl>

        {receipt.whatsappLink ? (
          
            href={receipt.whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex w-full items-center justify-center rounded-lg bg-primary px-6 py-4 text-base font-semibold text-primary-foreground transition hover:opacity-90 sm:w-auto"
          >
            Join now — don't wait
          </a>
        ) : (
          <p className="mt-8 rounded-lg border border-border p-4 text-sm text-muted-foreground">
            Your community link is being finalised — the academy team will email it to you shortly.
          </p>
        )}

        <p className="mt-4 text-sm text-muted-foreground">
          {receipt.emailSent
            ? `We've also emailed your receipt and this link to ${receipt.email}, in case you need it again.`
            : `Save this page's link — it's how you get into the community. If the receipt email doesn't arrive, contact ${ACADEMY.supportEmail}.`}
        </p>
      </div>
    </main>
  );
}
