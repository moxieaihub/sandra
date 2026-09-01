import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/* ------------------------------------------------------------------ *
 * CONFIGURE ME — waitlist destination.
 * Paste your Google Sheet / Zapier / Make / Mailchimp webhook URL here.
 * Leave as "" to run the flow in demo mode (no network call).
 * ------------------------------------------------------------------ */
const WAITLIST_ENDPOINT = "";

/* Optional: separate endpoint for partial-progress / drop-off pings.
 * Falls back to WAITLIST_ENDPOINT when empty. */
const PROGRESS_ENDPOINT = "";

/* Public link shared on the ending screen. */
const SHARE_URL = "https://sandraokunzuwaacademy.com/waitlist";
const SHARE_TEXT =
  "The Sandra Okunzuwa Entertainment Academy is opening soon — acting & producing. Join the waitlist:";

import { COUNTRIES, DEFAULT_COUNTRY_ISO2, countryByIso2, countryLabel, toE164 } from "@/lib/countries";

type QuestionId =
  | "fullName"
  | "email"
  | "phone"
  | "interest"
  | "location"
  | "level"
  | "source";

type Question =
  | {
      id: QuestionId;
      kind: "text" | "email" | "phone" | "country";
      label: string;
      helper?: string;
      placeholder?: string;
      required: boolean;
    }
  | {
      id: QuestionId;
      kind: "select";
      label: string;
      helper?: string;
      options: string[];
      required: boolean;
      allowOther?: boolean;
      otherPlaceholder?: string;
    };

const QUESTIONS: Question[] = [
  {
    id: "fullName",
    kind: "text",
    label: "What's your full name?",
    placeholder: "Amaka Okafor",
    required: true,
  },
  {
    id: "email",
    kind: "email",
    label: "What's your email address?",
    helper: "This is where your invitation lands.",
    placeholder: "you@email.com",
    required: true,
  },
  {
    id: "phone",
    kind: "phone",
    label: "What's your phone number?",
    helper: "For launch-day reminders.",
    placeholder: "+234 801 234 5678",
    required: true,
  },
  {
    id: "interest",
    kind: "select",
    label: "What's your primary interest?",
    options: ["Acting", "Producing", "Content Creator"],
    required: true,
  },
  {
    id: "location",
    kind: "country",
    label: "Which country are you based in?",
    helper: "Pick the country you'll be joining from.",
    required: true,
  },
  {
    id: "level",
    kind: "select",
    label: "What's your current level?",
    options: [
      "Complete beginner",
      "Some experience (self-taught)",
      "Trained but sharpening skills",
      "Working professional",
    ],
    required: true,
  },
  {
    id: "source",
    kind: "select",
    label: "How did you hear about us?",
    helper: "Optional.",
    options: ["Instagram", "TikTok", "YouTube", "Friend or referral", "Other"],
    required: false,
  },
];

type Answers = Record<QuestionId, string>;

const EMPTY: Answers = {
  fullName: "",
  email: "",
  phone: "",
  interest: "",
  location: "",
  level: "",
  source: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Stage = "welcome" | "questions" | "done";

export function WaitlistFlow() {
  const [stage, setStage] = useState<Stage>("welcome");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(EMPTY);
  const [phoneIso2, setPhoneIso2] = useState(DEFAULT_COUNTRY_ISO2);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const furthest = useRef(0);
  const sessionId = useRef(
    `wl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
  );

  const q = QUESTIONS[step]!;
  const total = QUESTIONS.length;
  const progress =
    stage === "welcome" ? 0 : stage === "done" ? 100 : (step / total) * 100;

  /* ---- partial progress logging (drop-off diagnostics) ---- */
  const logProgress = useCallback((index: number, status: string) => {
    if (index > furthest.current) furthest.current = index;
    const url = PROGRESS_ENDPOINT || WAITLIST_ENDPOINT;
    const payload = {
      type: "partial_progress",
      sessionId: sessionId.current,
      lastQuestionIndex: furthest.current,
      lastQuestionId: QUESTIONS[Math.min(furthest.current, total - 1)]?.id,
      status,
      timestamp: new Date().toISOString(),
    };
    if (!url) {
      console.info("[waitlist progress]", payload);
      return;
    }
    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  }, [total]);

  useEffect(() => {
    if (stage === "questions") logProgress(step, "reached");
  }, [stage, step, logProgress]);

  const setValue = (id: QuestionId, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setError(null);
  };

  const validate = (): string | null => {
    const raw = answers[q.id] ?? "";
    const value = raw.trim();
    if (q.required && !value) {
      return q.kind === "select" ? "Pick an option to continue." : "This one's required.";
    }
    if (q.id === "email" && !EMAIL_RE.test(value)) {
      return "That email doesn't look right.";
    }
    if (q.id === "phone" && value && value.replace(/\D/g, "").length < 7) {
      return "Add a full phone number.";
    }
    return null;
  };

  /* select answers auto-advance with the chosen value (no stale state) */
  const selectAnswer = (value: string) => {
    setValue(q.id, value);
    const id = q.id;
    window.setTimeout(() => {
      if (step === total - 1) {
        void submit(false, { [id]: value });
      } else {
        setStep((s) => s + 1);
      }
    }, 180);
  };

  const goNext = (skip = false) => {
    if (!skip) {
      const problem = validate();
      if (problem) {
        setError(problem);
        return;
      }
    }
    if (step === total - 1) {
      void submit(skip);
      return;
    }
    setError(null);
    setStep((s) => s + 1);
  };

  const goBack = () => {
    setError(null);
    setSubmitError(null);
    if (step === 0) {
      setStage("welcome");
      return;
    }
    setStep((s) => s - 1);
  };

  const submit = async (skippedLast = false, override: Partial<Answers> = {}) => {
    setSubmitting(true);
    setSubmitError(null);
    const a = { ...answers, ...override };
    const phoneCountry = countryByIso2(phoneIso2);
    const phoneE164 = toE164(phoneCountry?.dial ?? "+234", a.phone);
    const phone = phoneE164;
    const baseCountry = countryByIso2(a.location);
    const now = new Date();
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const signedUpAt = `${now.getDate()} ${days[now.getDay()]} ${months[now.getMonth()]} ${now.getFullYear()}`;
    const payload = {
      type: "waitlist_signup",
      sessionId: sessionId.current,
      fullName: a.fullName.trim(),
      email: a.email.trim(),
      phone,
      interest: a.interest,
      location: baseCountry?.name ?? a.location,
      country: baseCountry?.name ?? a.location,
      countryCode: baseCountry?.iso2 ?? null,
      phoneCountryCode: phoneCountry?.dial ?? null,
      phoneE164,
      level: a.level,
      source: skippedLast ? "" : a.source,
      lastQuestionIndex: total - 1,
      timestamp: signedUpAt,
    };
    try {
      // Always persist the signup (with its timestamp) in the database.
      const { error } = await supabase.from("waitlist_signups").insert({
        session_id: payload.sessionId,
        full_name: payload.fullName,
        email: payload.email,
        phone: payload.phone || null,
        interest: payload.interest || null,
        location: payload.location || null,
        country: payload.country || null,
        country_code: payload.countryCode,
        phone_country_code: payload.phoneCountryCode,
        phone_national: a.phone.replace(/\D/g, "").replace(/^0+/, "") || null,
        phone_e164: phoneE164,
        level: payload.level || null,
        source: payload.source || null,
        signed_up_at: payload.timestamp,
      });
      if (error) throw error;

      if (WAITLIST_ENDPOINT) {
        const res = await fetch(WAITLIST_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      }
      logProgress(total, "completed");
      setStage("done");
    } catch {
      setSubmitError(
        "We couldn't save your spot just then — your answers are safe. Give it another try.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(SHARE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="stage-glow relative min-h-[100dvh] bg-background text-foreground">
      <div
        className="fixed inset-x-0 top-0 z-20 h-[3px] bg-hairline"
        role="progressbar"
        aria-label="Waitlist progress"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-ember transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mx-auto flex min-h-[100dvh] w-full max-w-xl flex-col px-6 pb-12 pt-14 sm:px-8">
        {stage === "welcome" && (
          <Welcome onStart={() => setStage("questions")} />
        )}

        {stage === "questions" && (
          <QuestionScreen
            key={q.id}
            question={q}
            index={step}
            total={total}
            value={answers[q.id]}
            error={error}
            submitting={submitting}
            submitError={submitError}
            isLast={step === total - 1}
            phoneIso2={phoneIso2}
            onPhoneIso2Change={setPhoneIso2}
            onChange={(v) => setValue(q.id, v)}
            onSelect={selectAnswer}
            onNext={() => goNext(false)}
            onSkip={() => goNext(true)}
            onBack={goBack}
          />
        )}

        {stage === "done" && (
          <Done name={answers.fullName} copied={copied} onCopy={copyLink} />
        )}
      </div>
    </main>
  );
}

/* ------------------------------- screens ------------------------------- */

function Welcome({ onStart }: { onStart: () => void }) {
  return (
    <div className="screen-in flex flex-1 flex-col justify-center">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-ember">
        Sandra Okunzuwa Entertainment Academy
      </p>
      <h1 className="mt-6 font-sans text-[2.4rem] font-extrabold leading-[1.06] tracking-[-0.035em] sm:text-6xl">
        Be first in — join the Sandra Okunzuwa Entertainment Academy waitlist
      </h1>
      <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
        We're opening a limited number of spots before public launch. Get on the list and
        be the first to know when doors open.
      </p>
      <div className="mt-10">
        <PrimaryButton onClick={onStart}>Join the waitlist</PrimaryButton>
        <p className="mt-4 text-sm text-muted-foreground">
          Takes under a minute · 7 quick questions
        </p>
      </div>
    </div>
  );
}

function QuestionScreen(props: {
  question: Question;
  index: number;
  total: number;
  value: string;
  error: string | null;
  submitting: boolean;
  submitError: string | null;
  isLast: boolean;
  phoneIso2: string;
  onPhoneIso2Change: (iso2: string) => void;
  onChange: (v: string) => void;
  onNext: () => void;
  onSelect: (value: string) => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  const {
    question,
    index,
    total,
    value,
    error,
    submitting,
    submitError,
    isLast,
    phoneIso2,
    onPhoneIso2Change,
    onChange,
    onNext,
    onSelect,
    onSkip,
    onBack,
  } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = `q-${question.id}`;
  const errorId = `${inputId}-error`;
  const initiallyOther =
    question.kind === "select" &&
    !!question.allowOther &&
    value !== "" &&
    !question.options.includes(value);
  const [otherMode, setOtherMode] = useState(initiallyOther);

  useEffect(() => {
    if (question.kind !== "select" || otherMode) inputRef.current?.focus();
  }, [question, otherMode]);

  const inputType = useMemo(
    () => (question.kind === "email" ? "email" : question.kind === "phone" ? "tel" : "text"),
    [question.kind],
  );

  return (
    <div className="screen-in flex flex-1 flex-col">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-12 min-w-12 items-center gap-2 rounded-full border border-hairline px-4 text-sm text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span aria-hidden="true">←</span> Back
        </button>
        <span className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
          {index + 1} / {total}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-center py-10">
        <h2
          id={`${inputId}-label`}
          className="font-display text-[2rem] font-semibold leading-[1.12] tracking-[-0.015em] sm:text-4xl"
        >
          {question.label}
        </h2>
        {question.helper && (
          <p className="mt-3 text-sm text-muted-foreground">{question.helper}</p>
        )}

        <div className="mt-8">
          {question.kind === "select" ? (
            otherMode ? (
              <>
                <label htmlFor={inputId} className="sr-only">
                  {question.label}
                </label>
                <input
                  ref={inputRef}
                  id={inputId}
                  type="text"
                  value={value}
                  placeholder={question.otherPlaceholder ?? "Type your answer"}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? errorId : undefined}
                  onChange={(e) => onChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      onNext();
                    }
                  }}
                  className="h-14 w-full rounded-xl border border-hairline bg-surface px-5 text-lg text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-ember focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                />
                <button
                  type="button"
                  onClick={() => {
                    setOtherMode(false);
                    onChange("");
                  }}
                  className="mt-3 inline-flex items-center text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  ← Pick from the list
                </button>
              </>
            ) : (
              <div role="group" aria-labelledby={`${inputId}-label`} className="grid gap-3">
                {question.options.map((option, i) => {
                  const selected = value === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        onSelect(option);
                      }}
                      className={[
                        "flex min-h-[56px] items-center gap-4 rounded-xl border px-5 py-4 text-left text-base transition-all duration-200",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        selected
                          ? "border-ember bg-ember-soft text-foreground"
                          : "border-hairline bg-surface hover:border-ember/50 hover:bg-surface-2",
                      ].join(" ")}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-hairline text-xs font-semibold text-muted-foreground">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="font-medium">{option}</span>
                    </button>
                  );
                })}
                {question.allowOther && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange("");
                      setOtherMode(true);
                    }}
                    className={[
                      "flex min-h-[56px] items-center gap-4 rounded-xl border px-5 py-4 text-left text-base transition-all duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      "border-hairline bg-surface hover:border-ember/50 hover:bg-surface-2",
                    ].join(" ")}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-hairline text-xs font-semibold text-muted-foreground">
                      +
                    </span>
                    <span className="font-medium text-muted-foreground">Other…</span>
                  </button>
                )}
              </div>
            )
          ) : question.kind === "country" ? (
            <>
              <label htmlFor={inputId} className="sr-only">
                {question.label}
              </label>
              <select
                id={inputId}
                value={value}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? errorId : undefined}
                onChange={(e) => {
                  const next = e.target.value;
                  onChange(next);
                  if (next) onSelect(next);
                }}
                className="h-14 w-full rounded-xl border border-hairline bg-surface px-4 text-lg text-foreground transition-colors focus:border-ember focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <option value="">Select your country</option>
                {COUNTRIES.map((c) => (
                  <option key={c.iso2} value={c.iso2}>
                    {countryLabel(c)}
                  </option>
                ))}
              </select>
            </>
          ) : question.kind === "phone" ? (
            <>
              <label htmlFor={inputId} className="sr-only">
                {question.label}
              </label>
              <div className="flex gap-3">
                <select
                  value={phoneIso2}
                  onChange={(e) => onPhoneIso2Change(e.target.value)}
                  aria-label="Country dialling code"
                  required
                  className="h-14 min-w-[8.5rem] rounded-xl border border-hairline bg-surface px-3 text-base text-foreground transition-colors focus:border-ember focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.iso2} value={c.iso2}>
                      {c.flag} {c.dial} {c.name}
                    </option>
                  ))}
                </select>
                <input
                  ref={inputRef}
                  id={inputId}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={value}
                  placeholder="801 234 5678"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? errorId : undefined}
                  onChange={(e) => onChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      onNext();
                    }
                  }}
                  className="h-14 w-full rounded-xl border border-hairline bg-surface px-5 text-lg text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-ember focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                />
              </div>
            </>
          ) : (
            <>
              <label htmlFor={inputId} className="sr-only">
                {question.label}
              </label>
              <input
                ref={inputRef}
                id={inputId}
                type={inputType}
                autoComplete={question.kind === "email" ? "email" : "name"}
                value={value}
                placeholder={question.placeholder}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? errorId : undefined}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onNext();
                  }
                }}
                className="h-14 w-full rounded-xl border border-hairline bg-surface px-5 text-lg text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-ember focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              />
            </>
          )}
        </div>

        {error && (
          <p id={errorId} role="alert" className="mt-4 text-sm text-destructive">
            {error}
          </p>
        )}
        {submitError && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {submitError}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {(question.kind !== "select" || otherMode) && (
            <PrimaryButton onClick={onNext} disabled={submitting}>
              {submitting ? "Saving your spot…" : isLast ? "Submit" : "Continue"}
            </PrimaryButton>
          )}
          {question.kind === "select" && !otherMode && (isLast || submitError) && (
            <PrimaryButton onClick={onNext} disabled={submitting}>
              {submitting ? "Saving your spot…" : "Submit"}
            </PrimaryButton>
          )}
          {!question.required && (
            <button
              type="button"
              onClick={onSkip}
              disabled={submitting}
              className="inline-flex h-12 items-center rounded-full px-4 text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Skip
            </button>
          )}
        </div>

        {(question.kind !== "select" || otherMode) && (
          <p className="mt-4 text-xs text-muted-foreground">
            Press <span className="text-foreground">Enter ↵</span> to continue
          </p>
        )}
      </div>
    </div>
  );
}

function Done({
  name,
  copied,
  onCopy,
}: {
  name: string;
  copied: boolean;
  onCopy: () => void;
}) {
  const firstName = name.trim().split(" ")[0];
  const encoded = encodeURIComponent(`${SHARE_TEXT} ${SHARE_URL}`);
  return (
    <div className="screen-in flex flex-1 flex-col justify-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-ember bg-ember-soft text-2xl text-ember">
        ✓
      </div>
      <h1 className="font-display mt-8 text-[2.6rem] font-semibold leading-[1.05] tracking-[-0.02em] sm:text-5xl">
        You're on the list{firstName ? `, ${firstName}` : ""}.
      </h1>
      <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
        We'll email you the moment doors open — plus early access before anyone else.
      </p>

      <div className="mt-10 rounded-2xl border border-hairline bg-surface p-6">
        <p className="text-sm text-muted-foreground">
          Know someone who'd love this? Share the waitlist link with a friend.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <ShareLink href={`https://wa.me/?text=${encoded}`} label="WhatsApp" />
          <ShareLink
            href={`https://twitter.com/intent/tweet?text=${encoded}`}
            label="X"
          />
          <ShareLink href="https://www.instagram.com/" label="Instagram" />
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-ember bg-ember-soft px-4 text-sm font-semibold text-ember transition-colors hover:bg-ember hover:text-ember-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {copied ? "Link copied" : "Copy link"}
          </button>
        </div>
        <p className="mt-4 break-all text-xs text-muted-foreground">{SHARE_URL}</p>
      </div>
    </div>
  );
}

/* ------------------------------- pieces ------------------------------- */

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-ember px-7 text-base font-semibold text-ember-foreground transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {children}
    </button>
  );
}

function ShareLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-hairline bg-surface-2 px-4 text-sm font-semibold text-foreground transition-colors hover:border-ember/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {label}
    </a>
  );
}
