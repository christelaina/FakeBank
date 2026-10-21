import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg rounded-xl border border-surface-border bg-white px-6 py-10 text-center shadow-panel">
      <h1 className="font-display text-2xl font-semibold text-brand-950">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-brand-800/70">
        The requested FakeBank page does not exist.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-10 items-center rounded-md bg-brand-700 px-4 text-sm font-medium text-white"
      >
        Return to Overview
      </Link>
    </div>
  );
}
