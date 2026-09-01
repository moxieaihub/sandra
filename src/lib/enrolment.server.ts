import { supabaseAdmin } from "@/integrations/supabase/client.server";

import { ACADEMY, formatNaira } from "./academy-content";

export type VerifyResult = {
  status: "paid";
  reference: string;
  tierName: string;
  amountPaid: number;
  fullName: string;
  email: string;
  paidAt: string;
  whatsappLink: string;
  emailSent: boolean;
};

function receiptHtml(args: {
  firstName: string;
  reference: string;
  tierName: string;
  amountPaid: number;
  paidAt: string;
  whatsappLink: string;
  email: string;
}) {
  const linkBlock = args.whatsappLink
    ? `<a href="${args.whatsappLink}" style="display:inline-block;background:#5FD48A;color:#07160F;text-decoration:none;font-weight:600;padding:14px 24px;border-radius:8px;">Join your WhatsApp community</a>`
    : `<p style="color:#6b6b6b;">Your WhatsApp community link will be sent to you shortly by the academy team.</p>`;

  return `<!doctype html><html><body style="margin:0;background:#f2f7f3;font-family:Helvetica,Arial,sans-serif;color:#07160F;">
  <div style="max-width:560px;margin:0 auto;padding:24px;">
    <div style="background:#07160F;color:#EAF7EE;padding:24px;border-radius:8px 8px 0 0;">
      <div style="letter-spacing:.18em;font-size:11px;color:#5FD48A;">SANDRA OKUNZUWA</div>
      <div style="font-size:20px;margin-top:6px;">Entertainment Academy</div>
    </div>
    <div style="background:#ffffff;padding:24px;border-radius:0 0 8px 8px;">
      <p style="font-size:18px;margin:0 0 12px;">You're in, ${args.firstName}.</p>
      <p style="margin:0 0 20px;line-height:1.6;">Thank you for enrolling. Here is your receipt.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px 0;color:#6b6b6b;">Reference</td><td style="padding:8px 0;text-align:right;">${args.reference}</td></tr>
        <tr><td style="padding:8px 0;color:#6b6b6b;">Package</td><td style="padding:8px 0;text-align:right;">${args.tierName}</td></tr>
        <tr><td style="padding:8px 0;color:#6b6b6b;">Amount paid</td><td style="padding:8px 0;text-align:right;">${formatNaira(args.amountPaid)}</td></tr>
        <tr><td style="padding:8px 0;color:#6b6b6b;">Date</td><td style="padding:8px 0;text-align:right;">${args.paidAt}</td></tr>
        <tr><td style="padding:8px 0;color:#6b6b6b;">Email</td><td style="padding:8px 0;text-align:right;">${args.email}</td></tr>
      </table>
      <div style="margin:24px 0;">${linkBlock}</div>
      <p style="margin:0 0 8px;line-height:1.6;">Cohort 1 begins ${ACADEMY.dates.cohortStarts}. Save this email — the community link is how you get in.</p>
      <p style="margin:0;color:#6b6b6b;font-size:13px;">Need help? ${ACADEMY.supportEmail} · ${ACADEMY.supportWhatsApp}</p>
    </div>
  </div></body></html>`;
}

async function sendReceiptEmail(args: Parameters<typeof receiptHtml>[0]): Promise<boolean> {
  const key = process.env["RESEND_API_KEY"];
  if (!key) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: `${ACADEMY.name} <${ACADEMY.senderEmail}>`,
      to: [args.email],
      subject: "Your Sandra Okunzuwa Entertainment Academy receipt",
      html: receiptHtml(args),
    }),
  });

  if (!response.ok) {
    console.error("[resend] receipt email failed", response.status, await response.text());
    return false;
  }
  return true;
}

export async function verifyPayment(input: {
  registrationId: string;
  reference: string;
}): Promise<VerifyResult> {
  const secret = process.env["PAYSTACK_SECRET_KEY"];
  if (!secret) {
    throw new Error(
      "Payments are not live yet: the Paystack secret key has not been added to this site.",
    );
  }

  const { data: registration, error } = await supabaseAdmin
    .from("registrations")
    .select("*")
    .eq("id", input.registrationId)
    .maybeSingle();

  if (error || !registration) {
    throw new Error("We couldn't find your enrolment. Please contact support with your reference.");
  }

  const { data: tier } = await supabaseAdmin
    .from("tiers")
    .select("*")
    .eq("id", registration.tier_id)
    .maybeSingle();

  if (!tier) throw new Error("That package is no longer available. Please contact support.");

  const verifyResponse = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(input.reference)}`,
    { headers: { Authorization: `Bearer ${secret}` } },
  );
  const payload = (await verifyResponse.json()) as {
    status?: boolean;
    data?: { status?: string; amount?: number; paid_at?: string };
  };

  const paystackStatus = payload?.data?.status;
  const amountKobo = payload?.data?.amount ?? 0;

  if (!payload?.status || paystackStatus !== "success") {
    await supabaseAdmin
      .from("registrations")
      .update({ payment_status: "failed", paystack_reference: input.reference })
      .eq("id", registration.id);
    throw new Error("Your payment did not complete, so you have not been charged.");
  }

  if (amountKobo !== tier.price_naira * 100) {
    await supabaseAdmin
      .from("registrations")
      .update({ payment_status: "failed", paystack_reference: input.reference })
      .eq("id", registration.id);
    throw new Error(
      "The amount received did not match the package price. Nothing has been activated — please contact support.",
    );
  }

  const paidAtIso = payload.data?.paid_at ?? new Date().toISOString();
  const paidAt = new Date(paidAtIso).toLocaleString("en-NG", {
    dateStyle: "long",
    timeStyle: "short",
  });
  const firstName = registration.full_name.trim().split(/\s+/)[0] ?? "there";

  const emailSent = await sendReceiptEmail({
    firstName,
    reference: input.reference,
    tierName: tier.name,
    amountPaid: tier.price_naira,
    paidAt,
    whatsappLink: tier.whatsapp_link,
    email: registration.email,
  });

  await supabaseAdmin
    .from("registrations")
    .update({
      payment_status: "paid",
      paystack_reference: input.reference,
      amount_paid: tier.price_naira,
      whatsapp_link_sent: Boolean(tier.whatsapp_link),
      receipt_email_sent: emailSent,
    })
    .eq("id", registration.id);

  return {
    status: "paid",
    reference: input.reference,
    tierName: tier.name,
    amountPaid: tier.price_naira,
    fullName: registration.full_name,
    email: registration.email,
    paidAt,
    whatsappLink: tier.whatsapp_link,
    emailSent,
  };
}
