import { PageHeader } from "@/components/data-display/PageHeader";
import { EmptyState } from "@/components/feedback/EmptyState";

export function NotConnectedPage({ title }: { title: string }) {
  return (
    <div>
      <PageHeader title={title} />
      <EmptyState
        title={`${title} not connected yet`}
        description="This section has no live data source yet. No sample data is shown in live mode."
      />
    </div>
  );
}
