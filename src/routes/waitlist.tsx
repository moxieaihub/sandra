import { createFileRoute } from "@tanstack/react-router";
import { WaitlistFlow } from "@/components/WaitlistFlow";

const TITLE = "Join the Sandra Okunzuwa Entertainment Academy Waitlist";
const DESCRIPTION =
  "Be first in. Join the waitlist for the Sandra Okunzuwa Entertainment Academy — Nigeria's acting, producing and content creation academy.";

export const Route = createFileRoute("/waitlist")({
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
  component: WaitlistPage,
});

function WaitlistPage() {
  return <WaitlistFlow />;
}
