import Link from "next/link";
import type { LabFilePurpose } from "@/lib/lab/file-challenge";

export function LabChooseFileLink({ purpose }: { purpose: LabFilePurpose }) {
  return (
    <div className="space-y-3">
      <Link
        href={`/lab/files?purpose=${purpose}`}
        className="inline-flex h-10 items-center justify-center rounded-md bg-brand-700 px-4 text-sm font-medium text-white hover:bg-brand-800"
      >
        Choose file
      </Link>
      <p className="text-xs text-brand-800/60">Opens the lab file form.</p>
    </div>
  );
}
