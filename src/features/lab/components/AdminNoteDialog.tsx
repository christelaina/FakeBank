"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";

export function AdminNoteDialog({ note }: { note: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="inline-flex items-center rounded-md bg-brand-900 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800"
      >
        shhhhh
      </button>

      <dialog
        ref={dialogRef}
        className="w-full max-w-lg rounded-lg border border-amber-400 bg-amber-50 p-0 text-brand-900 shadow-lg backdrop:bg-black/40"
      >
        <div className="space-y-4 p-6 text-sm italic">
          <p>{note}</p>
          <p className="not-italic font-medium">-- Felonious Gru</p>
          <div className="flex justify-end">
            <Button type="button" variant="secondary" onClick={() => dialogRef.current?.close()}>
              Close
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
