import { PageHeader } from "@/components/data-display/PageHeader";

const sections = [
  {
    title: "Before a session",
    items: [
      "Set LAB_MODE=on and LAB_DATABASE_URL for the deployment, then redeploy.",
      "Apply schema files 0001 to 0014 to the lab database and seed the lab challenges.",
      "Confirm the admin account can sign in at /admin/sign-in.",
    ],
  },
  {
    title: "Points and hints",
    items: [
      "Points come from solved challenges minus hint costs.",
      "A hint costs half the challenge's points (minimum 1) and is deducted when bought.",
      "Each student can buy a given hint once. Points can go negative.",
    ],
  },
  {
    title: "Tracking students",
    items: [
      "The Leaderboard is read-only. Points cannot be changed from the admin side.",
      "Students see their own totals on the Progress page.",
    ],
  },
  {
    title: "Troubleshooting",
    items: [
      "Lab links missing from the navigation: check LAB_MODE and the user's role.",
      "Trading unavailable: NEXT_PUBLIC_DATA_MODE must be live. It is read at build time, so redeploy after changing it.",
      "Progress page error: confirm lab_hint_purchases and lab_challenges exist in the lab database.",
      "Environment changes do not apply until a new deployment is built.",
    ],
  },
  {
    title: "Keep private",
    items: [
      "Do not share challenge solutions, seeded passwords, hint walkthroughs, or environment values with students.",
    ],
  },
];

export function JobAidView() {
  return (
    <div>
      <PageHeader title="Job aid" description="Quick reference for running the lab. Internal use only." />

      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => (
          <section
            key={section.title}
            className="rounded-lg border border-surface-border bg-white p-5 shadow-panel"
          >
            <h2 className="mb-3 text-base font-semibold text-brand-950">{section.title}</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-brand-800">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
