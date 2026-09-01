import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";

import { EnrolmentForm } from "@/components/academy/EnrolmentForm";
import { Reveal } from "@/components/academy/Reveal";
import {
  ACADEMY,
  AUDIENCES,
  BENEFITS,
  CREDIBILITY_STATS,
  CURRICULUM,
  FAQS,
  FEATURE_ROWS,
  PRICING_DISCLAIMER,
  SANDRA_BIO,
  TIER_COPY,
  formatNaira,
} from "@/lib/academy-content";
import { tiersQueryOptions } from "@/lib/tiers";
import heroAsset from "@/assets/sandra-award.jpg";
const portraitAsset = heroAsset;
import logoAsset from "@/assets/logo-soea.png";

const TITLE = "Sandra Okunzuwa Entertainment Academy — Enrol for Cohort 1";
const DESCRIPTION =
  "Six weeks of practical online entertainment training with Nollywood producer Sandra Okunzuwa, plus a physical industry week in Lagos. Enrol from ₦10,000.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AcademyPage,
});

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ block: "start" });
}

const NAV = [
  ["About", "about"],
  ["Academy", "academy"],
  ["Curriculum", "curriculum"],
  ["Pricing", "pricing"],
  ["FAQ", "faq"],
] as const;

function AcademyPage() {
  const { data: tiers = [], isLoading } = useQuery(tiersQueryOptions);
  const [selectedTierId, setSelectedTierId] = useState("professional");

  function selectTier(id: string) {
    setSelectedTierId(id);
  }

  return (
    <div className="min-h-screen bg-background text-foreground stage-glow">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3">
          <a href="#top" className="flex min-w-0 items-center gap-3">
            <img src={logoAsset.url} alt="" width={36} height={36} className="h-9 w-9 shrink-0" />
            <span className="hidden truncate text-xs tracking-[0.22em] text-muted-foreground sm:block">
              SANDRA OKUNZUWA ENTERTAINMENT ACADEMY
            </span>
          </a>
          <div className="flex items-center gap-2 sm:gap-5">
            <nav className="hidden items-center gap-5 text-sm text-muted-foreground lg:flex">
              {NAV.map(([label, id]) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="transition hover:text-primary"
                >
                  {label}
                </button>
              ))}
            </nav>
            <button
              onClick={() => scrollTo("pricing")}
              className="min-h-11 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Enrol now
            </button>
          </div>
        </div>
      </header>

      <main id="top">
        {/* Hero */}
        <section className="relative isolate flex min-h-[88vh] items-end overflow-hidden">
          <img
            src={heroAsset.url}
            alt="Sandra Okunzuwa holding her YouTube Gold Play Button award"
            width={1141}
            height={1280}
            className="absolute inset-0 -z-10 h-full w-full object-cover object-top"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/70 to-background/20" />
          <div className="mx-auto w-full max-w-6xl px-5 pb-20 pt-32">
            <p className="text-xs tracking-[0.35em] text-primary">LEARN. CREATE. CONNECT. EARN.</p>
            <h1 className="mt-6 max-w-3xl font-display text-4xl leading-[1.05] sm:text-6xl lg:text-7xl">
              Turn your talent into a career in entertainment.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Six weeks of practical entertainment training online. One physical industry week in
              Lagos. A community that continues beyond graduation.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <button
                onClick={() => scrollTo("pricing")}
                className="min-h-12 rounded-lg bg-primary px-7 py-4 text-base font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Choose your package
              </button>
              <button
                onClick={() => scrollTo("curriculum")}
                className="min-h-12 rounded-lg border border-border px-7 py-4 text-base font-medium transition hover:border-primary"
              >
                See the curriculum
              </button>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              Cohort 1 begins {ACADEMY.dates.cohortStarts} · Limited places ·{" "}
              <Link to="/waitlist" className="text-primary underline-offset-4 hover:underline">
                Join the waitlist instead
              </Link>
            </p>
          </div>
        </section>

        {/* About Sandra */}
        <Section id="about">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:items-start">
            <Reveal>
              <img
                src={portraitAsset.url}
                alt="Portrait of Sandra Okunzuwa with her YouTube award"
                width={1141}
                height={1280}
                loading="lazy"
                className="w-full rounded-lg object-cover"
              />
            </Reveal>
            <Reveal delay={80}>
              <h2 className="font-display text-3xl sm:text-5xl">Who is Sandra Okunzuwa?</h2>
              <div className="mt-6 space-y-5 leading-relaxed text-muted-foreground">
                {SANDRA_BIO.map((paragraph) => (
                  <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                ))}
              </div>
              <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-border pt-8 sm:grid-cols-4">
                {CREDIBILITY_STATS.map((stat) => (
                  <div key={stat.label}>
                    <dt className="font-display text-3xl text-primary">{stat.value}</dt>
                    <dd className="mt-1 text-sm text-muted-foreground">{stat.label}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </Section>

        {/* What is the academy */}
        <Section id="academy">
          <Reveal>
            <h2 className="max-w-3xl font-display text-3xl sm:text-5xl">
              A practical school for the business and craft of entertainment.
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              The academy is a seven-week programme that teaches how the entertainment industry
              actually works — how to build real skills, create real work, meet the right people,
              and turn talent into income. Six weeks of structured online learning, mostly
              pre-recorded so students learn at their own pace, with Sandra hosting one live session
              every week. Week seven is a physical industry week in Lagos.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {AUDIENCES.map((audience, index) => (
              <Reveal key={audience.title} delay={index * 80}>
                <article className="h-full rounded-lg border border-border bg-card p-7">
                  <h3 className="font-display text-2xl text-primary">{audience.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{audience.copy}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* Curriculum */}
        <Section id="curriculum">
          <Reveal>
            <h2 className="font-display text-3xl sm:text-5xl">What you'll learn</h2>
          </Reveal>
          <ol className="mt-12 border-l border-border">
            {CURRICULUM.map((item, index) => (
              <Reveal key={item.week} delay={index * 50}>
                <li className="relative pb-10 pl-8">
                  <span className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-primary" />
                  <p className="text-xs tracking-[0.25em] text-primary">{item.week.toUpperCase()}</p>
                  <h3 className="mt-2 font-display text-2xl">{item.title}</h3>
                  <p className="mt-2 max-w-2xl leading-relaxed text-muted-foreground">{item.copy}</p>
                </li>
              </Reveal>
            ))}
          </ol>

          <Reveal>
            <div className="mt-6 rounded-lg border border-primary/60 bg-primary/5 p-7 sm:p-10">
              <p className="text-xs tracking-[0.25em] text-primary">WEEK 7</p>
              <h3 className="mt-3 font-display text-2xl sm:text-3xl">The Lagos Industry Week</h3>
              <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
                The programme ends in person. A final showcase, practical industry workshops, real
                networking, and behind-the-scenes exposure to how a professional production
                operates. Sandra and the academy team review exceptional students for consideration
                on future productions.
              </p>
            </div>
          </Reveal>
        </Section>

        {/* Benefits */}
        <Section id="why">
          <Reveal>
            <h2 className="font-display text-3xl sm:text-5xl">Why join</h2>
          </Reveal>
          <ul className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((benefit, index) => (
              <Reveal key={benefit} delay={index * 50}>
                <li className="flex gap-4">
                  <span aria-hidden className="mt-1 text-primary">
                    ◆
                  </span>
                  <span className="leading-relaxed text-muted-foreground">{benefit}</span>
                </li>
              </Reveal>
            ))}
          </ul>
        </Section>

        {/* Pricing */}
        <Section id="pricing">
          <Reveal>
            <h2 className="font-display text-3xl sm:text-5xl">Choose your package</h2>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              One payment. Cohort 1 only. Every package includes the full six-week curriculum and
              the community.
            </p>
          </Reveal>

          {isLoading ? (
            <p className="mt-12 text-muted-foreground">Loading packages…</p>
          ) : (
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {tiers.map((tier, index) => {
                const copy = TIER_COPY[tier.id];
                const featured = tier.id === "professional";
                return (
                  <Reveal key={tier.id} delay={index * 80}>
                    <article
                      className={`flex h-full flex-col rounded-lg border p-7 transition duration-300 hover:-translate-y-1 ${
                        featured ? "border-primary bg-primary/5" : "border-border bg-card"
                      }`}
                    >
                      {featured ? (
                        <span className="mb-4 self-start rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                          Most popular
                        </span>
                      ) : null}
                      <h3 className="font-display text-2xl">{tier.name}</h3>
                      <p className="mt-3 font-display text-4xl text-primary">
                        {formatNaira(tier.price_naira)}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {copy?.positioning}
                      </p>
                      <ul className="mt-6 flex-1 space-y-3 border-t border-border pt-6 text-sm">
                        {FEATURE_ROWS.map((row) => {
                          const value = copy?.features[row] ?? "—";
                          return (
                            <li key={row} className="flex justify-between gap-4">
                              <span className="text-muted-foreground">{row}</span>
                              <span className="text-right font-medium">{value}</span>
                            </li>
                          );
                        })}
                      </ul>
                      <button
                        onClick={() => {
                          selectTier(tier.id);
                          scrollTo("enrol");
                        }}
                        className={`mt-7 min-h-12 rounded-lg px-6 py-3 text-sm font-semibold transition hover:opacity-90 ${
                          featured
                            ? "bg-primary text-primary-foreground"
                            : "border border-primary text-primary"
                        }`}
                      >
                        Select {tier.name}
                      </button>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          )}

          <p className="mt-8 max-w-3xl text-xs leading-relaxed text-muted-foreground">
            {PRICING_DISCLAIMER}
          </p>
        </Section>

        {/* Key dates */}
        <section className="border-y border-border bg-card">
          <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Enrolment closes", ACADEMY.dates.enrolmentCloses],
              ["Cohort 1 begins", ACADEMY.dates.cohortStarts],
              ["Online weeks 1–6", ACADEMY.dates.onlineWeeks],
              ["Lagos industry week", ACADEMY.dates.lagosWeek],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs tracking-[0.2em] text-primary">
                  {String(label).toUpperCase()}
                </p>
                <p className="mt-2 text-sm">{value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Enrolment */}
        <Section id="enrol">
          <Reveal>
            <h2 className="font-display text-3xl sm:text-5xl">Enrol</h2>
          </Reveal>
          <div className="mt-10">
            <EnrolmentForm tiers={tiers} selectedTierId={selectedTierId} onSelectTier={selectTier} />
          </div>
        </Section>

        {/* FAQ */}
        <Section id="faq">
          <Reveal>
            <h2 className="font-display text-3xl sm:text-5xl">Questions</h2>
          </Reveal>
          <div className="mt-10 divide-y divide-border border-y border-border">
            {FAQS.map((faq) => (
              <details key={faq.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-base sm:text-lg">
                  {faq.q}
                  <span aria-hidden className="text-primary transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">{faq.a}</p>
              </details>
            ))}
          </div>
        </Section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-14 sm:flex-row sm:justify-between">
          <div>
            <img
              src={logoAsset.url}
              alt=""
              width={44}
              height={44}
              loading="lazy"
              className="h-11 w-11"
            />
            <p className="mt-4 font-display text-lg">{ACADEMY.name}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              <a href={`mailto:${ACADEMY.supportEmail}`}>{ACADEMY.supportEmail}</a>
              <br />
              WhatsApp {ACADEMY.supportWhatsApp}
            </p>
            <p className="mt-4 text-sm">
              <Link to="/waitlist" className="text-primary underline-offset-4 hover:underline">
                Join the waitlist
              </Link>
            </p>
          </div>
          <nav aria-label="Social links" className="flex flex-wrap gap-6 text-sm">
            {Object.entries(ACADEMY.socials).map(([name, href]) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="capitalize text-muted-foreground transition hover:text-primary"
              >
                {name}
              </a>
            ))}
          </nav>
        </div>
        <p className="mx-auto max-w-6xl px-5 pb-10 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {ACADEMY.name}. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

function Section({ id, children }: { id: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-border/60">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:py-28">{children}</div>
    </section>
  );
}
