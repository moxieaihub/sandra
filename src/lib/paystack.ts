export const PAYSTACK_PUBLIC_KEY = import.meta.env["VITE_PAYSTACK_PUBLIC_KEY"] as
  | string
  | undefined;

export const paymentsEnabled = Boolean(PAYSTACK_PUBLIC_KEY);

type PaystackHandler = { openIframe: () => void };
type PaystackSetupOptions = {
  key: string;
  email: string;
  amount: number;
  currency: string;
  ref: string;
  channels: string[];
  metadata: Record<string, unknown>;
  callback: (response: { reference: string }) => void;
  onClose: () => void;
};

declare global {
  interface Window {
    PaystackPop?: { setup: (options: PaystackSetupOptions) => PaystackHandler };
  }
}

let scriptPromise: Promise<void> | null = null;

export function loadPaystack(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Browser only"));
  if (window.PaystackPop) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("We couldn't reach Paystack. Check your connection and try again."));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export function makeReference(): string {
  return `SOEA-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;
}

export async function openPaystackCheckout(args: {
  email: string;
  amountNaira: number;
  reference: string;
  metadata: Record<string, unknown>;
}): Promise<{ reference: string } | null> {
  await loadPaystack();
  const paystack = window.PaystackPop;
  if (!paystack) throw new Error("The payment window could not be opened. Please try again.");

  return new Promise((resolve) => {
    const handler = paystack.setup({
      key: PAYSTACK_PUBLIC_KEY as string,
      email: args.email,
      amount: args.amountNaira * 100,
      currency: "NGN",
      ref: args.reference,
      channels: ["card", "bank_transfer"],
      metadata: args.metadata,
      callback: (response) => resolve({ reference: response.reference }),
      onClose: () => resolve(null),
    });
    handler.openIframe();
  });
}
