import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { Reveal } from "@/components/academy/Reveal";
import {
  ACADEMY,
  CATEGORIES,
  HEARD_FROM,
  NIGERIAN_STATES,
  formatNaira,
} from "@/lib/academy-content";
import { createZapCheckoutFn } from "@/lib/zap-pay.functions";
import { COUNTRIES, DEFAULT_COUNTRY_ISO2, countryByIso2, countryLabel, toE164 } from "@/lib/countries";
import type { Tier } from "@/lib/tiers";
import { supabase } from "@/integrations/supabase/client";

function makeReference(): string {
  return `SOEA-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;
}

const paymentsEnabled = true;

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  category: string;
  heardFrom: string;
  phoneCountry: string;
};

const emptyForm: FormState = {
  fullName: "",
  email: "",
  phone: "",
  country: DEFAULT_COUNTRY_ISO2,
  state: "",
  city: "",
  category: "",
  heardFrom: "",
  phoneCountry: DEFAULT_COUNTRY_ISO2,
};

const fieldClass =
  "w-full rounded-lg border border-border bg-secondary px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none";

function validate(form: FormState, tierId: string) {
  const errors: Partial<Record<keyof FormState | "tier", string>> = {};
  if (form.fullName.trim().length < 3) errors.fullName = "Enter your full name as it should appear on your certificate.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()))
    errors.email = "Enter a valid email address — your receipt is sent here.";
  const digits = form.phone.replace(/\D/g, "");
  if (!form.phoneCountry) errors.phoneCountry = "Select your country dialling code.";
  if (digits.length < 6) errors.phone = "Enter your WhatsApp number, e.g. 8012345678.";
  if (!form.country) errors.country = "Select the country you live in.";
  if (!form.state.trim()) errors.state = "Tell us your state or region.";
  if (!form.category) errors.category = "Tell us which one describes you.";
  if (!form.heardFrom) errors.heardFrom = "Let us know how you heard about the academy.";
  if (!tierId) errors.tier = "Choose a package above.";
  return errors;
}

export function EnrolmentForm({
  tiers,
  selectedTierId,
  onSelectTier,
}: {
  tiers: Tier[];
  selectedTierId: string;
  onSelectTier: (id: string) => void;
}) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | "tier", string>>>({});
  const [failure, setFailure] = useState<string | null>(null);

  const selectedTier = tiers.find((tier) => tier.id === selectedTierId) ?? null;

  const set = (key: keyof FormState) => (value: string) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  };

  const enrol = useMutation({
    mutationFn: async () => {
      if (!selectedTier) throw new Error("Choose a package above.");
      const phoneCountry = countryByIso2(form.phoneCountry);
      const country = countryByIso2(form.country);
      const phoneE164 = toE164(phoneCountry?.dial ?? "+234", form.phone);

      const { data: registration, error } = await supabase
        .from("registrations")
        .insert({
          full_name: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          phone: phoneE164,
          phone_country_code: phoneCountry?.dial ?? null,
          phone_national: form.phone.replace(/\D/g, "").replace(/^0+/, ""),
          phone_e164: phoneE164,
          country: country?.name ?? null,
          country_code: country?.iso2 ?? null,
          state: form.state.trim(),
          city: form.city.trim() || null,
          category: form.category,
          tier_id: selectedTier.id,
          heard_from: form.heardFrom,
          payment_status: "pending",
        })
        .select("id")
        .single();

      if (error || !registration)
        throw new Error("We couldn't start your enrolment. Please check your details and try again.");

      const reference = makeReference();
      const redirectUrl = `${window.location.origin}/enrol/complete?registrationId=${registration.id}&reference=${reference}`;

      const { checkoutUrl } = await createZapCheckoutFn({
        data: {
          amountNaira: selectedTier.price_naira,
          reference,
          description: `${selectedTier.name} — ${ACADEMY.name}`,
          redirectUrl,
          metadata: { registration_id: registration.id, tier_id: selectedTier.id },
        },
      });

      window.location.href = checkoutUrl;
      return null;
    },
    onError: (error: Error) => setFailure(error.message),
  });

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors = validate(form, selectedTierId);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setFailure(null);
    enrol.mutate();
  }

  return (
    <Reveal>
      <form onSubmit={submit} noValidate className="rounded-lg border border-border bg-card p-6 sm:p-10">
        <h3 className="font-display text-3xl">Reserve your place</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Takes two minutes. Your receipt and community link arrive the moment payment clears.
        </p>

        {failure ? (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-destructive/60 bg-destructive/10 p-4 text-sm"
          >
            <p className="font-medium">Your payment didn't complete.</p>
            <p className="mt-1 text-muted-foreground">{failure}</p>
            <p className="mt-1 text-muted-foreground">
              Any amount held will be reversed. Your details are still filled in below — press Try
              again, or contact {ACADEMY.supportEmail} / {ACADEMY.supportWhatsApp}.
            </p>
          </div>
        ) : null}

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <Field label="Full name" error={errors.fullName}>
            <input
              className={fieldClass}
              value={form.fullName}
              autoComplete="name"
              onChange={(event) => set("fullName")(event.target.value)}
            />
          </Field>
          <Field label="Email address" error={errors.email}>
            <input
              className={fieldClass}
              type="email"
              inputMode="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => set("email")(event.target.value)}
            />
          </Field>
          <Field label="WhatsApp phone number" error={errors.phone ?? errors.phoneCountry}>
            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                aria-label="Country dialling code"
                required
                className={`${fieldClass} w-full sm:w-40 sm:shrink-0`}
                value={form.phoneCountry}
                onChange={(event) => set("phoneCountry")(event.target.value)}
              >
                {COUNTRIES.map((country) => (
                  <option key={country.iso2} value={country.iso2}>
                    {country.flag} {country.dial} {country.name}
                  </option>
                ))}
              </select>
              <input
                className={`${fieldClass} min-w-0 flex-1`}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="8012345678"
                value={form.phone}
                onChange={(event) => set("phone")(event.target.value)}
              />
            </div>
          </Field>
          <Field label="Country" error={errors.country}>
            <select
              className={fieldClass}
              value={form.country}
              onChange={(event) => {
                const iso2 = event.target.value;
                setForm((previous) => ({
                  ...previous,
                  country: iso2,
                  phoneCountry: iso2 || previous.phoneCountry,
                  state: "",
                }));
                setErrors((previous) => {
                  const next = { ...previous };
                  delete next.country;
                  delete next.state;
                  return next;
                });
              }}
            >
              <option value="">Select your country</option>
              {COUNTRIES.map((country) => (
                <option key={country.iso2} value={country.iso2}>
                  {countryLabel(country)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="State / region" error={errors.state}>
            {form.country === "NG" ? (
              <select
                className={fieldClass}
                value={form.state}
                onChange={(event) => set("state")(event.target.value)}
              >
                <option value="">Select your state</option>
                {NIGERIAN_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className={fieldClass}
                value={form.state}
                placeholder="e.g. Greater London"
                onChange={(event) => set("state")(event.target.value)}
              />
            )}
          </Field>
          <Field label="City (optional)">
            <input
              className={fieldClass}
              value={form.city}
              onChange={(event) => set("city")(event.target.value)}
            />
          </Field>
          <Field label="Which describes you?" error={errors.category}>
            <select
              className={fieldClass}
              value={form.category}
              onChange={(event) => set("category")(event.target.value)}
            >
              <option value="">Select one</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </Field>
          <Field label="How did you hear about us?" error={errors.heardFrom}>
            <select
              className={fieldClass}
              value={form.heardFrom}
              onChange={(event) => set("heardFrom")(event.target.value)}
            >
              <option value="">Select one</option>
              {HEARD_FROM.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <fieldset className="mt-8">
          <legend className="text-sm font-medium text-muted-foreground">Package</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {tiers.map((tier) => {
              const active = tier.id === selectedTierId;
              return (
                <label
                  key={tier.id}
                  className={`cursor-pointer rounded-lg border p-4 transition ${
                    active ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="tier"
                    className="sr-only"
                    checked={active}
                    onChange={() => onSelectTier(tier.id)}
                  />
                  <span className="block text-sm text-muted-foreground">{tier.name}</span>
                  <span className="mt-1 block font-display text-2xl">
                    {formatNaira(tier.price_naira)}
                  </span>
                </label>
              );
            })}
          </div>
          {errors.tier ? <p className="mt-2 text-sm text-destructive">{errors.tier}</p> : null}
        </fieldset>

        <button
          type="submit"
          disabled={enrol.isPending}
          className="mt-8 w-full rounded-lg bg-primary px-6 py-4 text-base font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          {enrol.isPending
            ? "Processing…"
            : failure
              ? "Try again"
              : `Pay ${selectedTier ? formatNaira(selectedTier.price_naira) : "—"}`}
        </button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Card, bank transfer, and crypto.
          {paymentsEnabled ? "" : " Payments go live once the academy's Zap Pay keys are added."}
        </p>
      </form>
    </Reveal>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-muted-foreground">{label}</span>
      {children}
      {error ? <span className="mt-2 block text-sm text-destructive">{error}</span> : null}
    </label>
  );
}
