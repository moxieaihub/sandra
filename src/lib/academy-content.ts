// Placeholder copy — replace with Sandra's real bio, dates, contacts and socials.

export const ACADEMY = {
  name: "Sandra Okunzuwa Entertainment Academy",
  shortName: "Sandra Okunzuwa Academy",
  supportEmail: "hello@sandraokunzuwaacademy.com",
  senderEmail: "receipts@sandraokunzuwaacademy.com",
  supportWhatsApp: "+234 801 234 5678",
  socials: {
    instagram:
      "https://www.instagram.com/sandraokunzuwa?igsh=MXU1eWVhMDUwZnN5MA==",
    youtube: "https://youtube.com/@sandraokunzuwatv",
    website: "https://sandracreativeacademy.com",
  },
  dates: {
    enrolmentCloses: "10 October 2026",
    cohortStarts: "19 October 2026",
    onlineWeeks: "19 October – 29 November 2026",
    lagosWeek: "30 November – 6 December 2026",
  },
} as const;

export const SANDRA_BIO = [
  "Sandra Okunzuwa is a Nigerian actress and producer who has spent more than a decade working inside Nollywood — on set, in the edit suite, and in the rooms where projects get financed and greenlit. She has appeared in feature films and series that have travelled from Lagos cinemas to major streaming platforms, and has produced original work under her own banner, Sandra Okunzuwa TV.",
  "Her route into the industry was not a straight line. She learned auditions by failing them, learned production by budgeting projects that almost fell apart, and learned distribution by knocking on doors until they opened. Along the way she built an audience of hundreds of thousands who follow her work and her advice about breaking into entertainment.",
  "She is building this academy because talent in Nigeria is abundant and access is not. The programme is the guide she wishes she had: what the industry actually pays for, how to build work worth showing, and how to meet the people who can put you to work.",
];

export const CREDIBILITY_STATS = [
  { value: "12+", label: "Years in the industry" },
  { value: "25+", label: "Film & series credits" },
  { value: "1.14M", label: "YouTube subscribers" },
  { value: "6", label: "Productions produced" },
];

export const AUDIENCES = [
  {
    title: "Actors",
    copy: "For aspiring and developing actors. Acting craft, auditions, self-tapes, showreels, branding, set etiquette and how to find opportunities.",
  },
  {
    title: "Producers & Filmmakers",
    copy: "For people who want to make films and understand production. Script selection, development, budgeting, casting and crew, production, distribution, streaming and promotion.",
  },
  {
    title: "Content Creators",
    copy: "For YouTubers, TikTok and Instagram creators. Content strategy, filming, storytelling, platform growth, YouTube monetisation and building an audience.",
  },
];

export const CURRICULUM = [
  {
    week: "Week 1",
    title: "Entertainment Industry & Career Direction",
    copy: "How the industry and Nollywood work, where the opportunities are, how actors, filmmakers and creators make money, and mapping your own path.",
  },
  {
    week: "Week 2",
    title: "Craft, Story & Creation",
    copy: "Acting fundamentals, developing ideas and scripts, finding your niche and building content that audiences want to watch.",
  },
  {
    week: "Week 3",
    title: "Building Your Professional Portfolio",
    copy: "Self-tapes and showreels, pitch decks and production planning, shooting and editing content, and presenting yourself professionally.",
  },
  {
    week: "Week 4",
    title: "The Business of Entertainment",
    copy: "Contracts, copyright, negotiating fees, brand deals, film financing, distribution, streamers, YouTube monetisation.",
  },
  {
    week: "Week 5",
    title: "Production, Audience & Execution",
    copy: "Taking a project from script to screen, collaborating across disciplines, promoting finished work and building an audience.",
  },
  {
    week: "Week 6",
    title: "Career Launch & Final Preparation",
    copy: "Portfolio review, approaching opportunities professionally, building real relationships, and preparing your final submission.",
  },
];

export const BENEFITS = [
  "Weekly practical assignments that build a real portfolio",
  "Recorded masterclasses from working industry professionals",
  "A live session with Sandra every week",
  "Certificate of completion",
  "A community and alumni network that continues after graduation",
  "Merit-based consideration for opportunities on Sandra Okunzuwa TV productions",
];

export const TIER_COPY: Record<
  string,
  { positioning: string; features: Record<string, string> }
> = {
  foundation: {
    positioning: "Start here. Everything you need to learn the fundamentals.",
    features: {
      "Six-week pre-recorded curriculum": "✓",
      "Weekly practical assignments": "✓",
      "Community membership": "✓",
      Certificate: "✓",
      "Sandra live sessions": "1 live session",
      "Assignment & portfolio feedback": "Basic",
      "Guest masterclasses": "Core selected sessions",
      "Networking & collaboration access": "✓",
      "Lagos Week 7": "Exceptional students may be invited",
      "Showcase & opportunity consideration": "Selected top performers",
      "Additional mentorship": "—",
    },
  },
  professional: {
    positioning: "For students serious about building a career this cohort.",
    features: {
      "Six-week pre-recorded curriculum": "✓",
      "Weekly practical assignments": "✓",
      "Community membership": "✓",
      Certificate: "✓",
      "Sandra live sessions": "Selected live sessions, increased access",
      "Assignment & portfolio feedback": "Enhanced",
      "Guest masterclasses": "Full relevant library",
      "Networking & collaboration access": "✓",
      "Lagos Week 7": "Priority / selected access",
      "Showcase & opportunity consideration": "Selected top performers",
      "Additional mentorship": "Group guidance",
    },
  },
  elite: {
    positioning: "Closest access to Sandra and the industry.",
    features: {
      "Six-week pre-recorded curriculum": "✓",
      "Weekly practical assignments": "✓",
      "Community membership": "✓",
      Certificate: "✓",
      "Sandra live sessions": "All 6 weekly live sessions",
      "Assignment & portfolio feedback": "Priority",
      "Guest masterclasses": "Full relevant library",
      "Networking & collaboration access": "✓",
      "Lagos Week 7": "Included, priority access",
      "Showcase & opportunity consideration": "Priority consideration",
      "Additional mentorship": "Small-group / selected mentorship",
    },
  },
};

export const FEATURE_ROWS = Object.keys(TIER_COPY["foundation"]?.features ?? {});

export const PRICING_DISCLAIMER =
  "Opportunities on Sandra Okunzuwa TV productions and related work are offered on merit, based on the quality of a student's work and the productions available at the time. No package guarantees casting, employment or paid work.";

export const FAQS = [
  {
    q: "Do I need experience?",
    a: "No. The programme is built for people starting out as well as those already working who want structure and industry understanding.",
  },
  {
    q: "Do I need to be in Lagos?",
    a: "No. Weeks 1–6 are fully online. Only Week 7 is physical, in Lagos.",
  },
  {
    q: "How much time will I need each week?",
    a: "Lessons are pre-recorded so you can watch on your own schedule, plus one live session and one practical assignment each week.",
  },
  {
    q: "What equipment do I need?",
    a: "A phone with a camera and a stable internet connection is enough to complete the programme.",
  },
  {
    q: "How do I get into the community?",
    a: "Immediately after payment you'll receive your WhatsApp community link on screen and by email.",
  },
  {
    q: "Can I upgrade my package later?",
    a: `Yes. You can upgrade at any point before the Lagos industry week by paying the difference between your package and the higher one. Email ${ACADEMY.supportEmail} and the team will send you an upgrade link.`,
  },
  {
    q: "Is the fee refundable?",
    a: "Fees are fully refundable up to 7 days before the cohort begins. Once the programme starts the fee is non-refundable, but your place can be transferred to the next cohort once.",
  },
  {
    q: "Who do I contact for help?",
    a: `Email ${ACADEMY.supportEmail} or message ${ACADEMY.supportWhatsApp} on WhatsApp. The team replies within one working day.`,
  },
];

export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Federal Capital Territory",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

export const CATEGORIES = ["Actor", "Producer or Filmmaker", "Content Creator"];

export const HEARD_FROM = ["Instagram", "TikTok", "YouTube", "A friend", "Other"];

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}
