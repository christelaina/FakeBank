import { NextResponse } from "next/server";

// Lab routes and sign-up victim accounts exist only when LAB_MODE is "on".
export function isLabEnabled(): boolean {
  return process.env.LAB_MODE === "on";
}

export function labNotFoundResponse() {
  return NextResponse.json({ code: "NOT_FOUND", message: "Not found." }, { status: 404 });
}
