import { PageHeader } from "@/components/data-display/PageHeader";
import type { ChallengeGuide } from "@/lib/server/lab/walkthroughs";

export function WalkthroughsView({ challenges }: { challenges: ChallengeGuide[] }) {
  return (
    <div>
      <PageHeader
        title="Walkthroughs"
        description="Step-by-step solutions for each challenge. Students only see these after buying a hint. Do not share them."
      />

      <div className="space-y-4">
        {challenges.map((challenge) => (
          <section
            key={challenge.id}
            className="rounded-lg border border-surface-border bg-white p-5 shadow-panel"
          >
            <div className="mb-2 flex items-baseline justify-between gap-4">
              <h2 className="text-base font-semibold text-brand-950">{challenge.title}</h2>
              <span className="text-sm text-brand-800/70">{challenge.points} points</span>
            </div>
            <p className="mb-4 text-sm text-brand-800">{challenge.description}</p>
            {challenge.steps.length > 0 ? (
              <ol className="list-decimal space-y-2 pl-5 text-sm text-brand-800">
                {challenge.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-brand-800/70">No steps yet.</p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
