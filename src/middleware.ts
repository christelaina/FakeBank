// src/middleware.ts
import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "fakebank_session";
const PUBLIC_PATHS = ["/sign-in", "/admin/sign-in", "/create-account"];

// In live mode, every page requires a session cookie. API routes enforce auth themselves
// and return 401, so they are not redirected here.
export function middleware(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_DATA_MODE !== "live") {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  if (!request.cookies.get(SESSION_COOKIE)?.value) {
    const signInUrl = new URL("/sign-in", request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/|_next/static|_next/image|favicon.ico).*)"],
};
