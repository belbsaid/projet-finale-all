import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authToken = request.cookies.get("auth-token")?.value;
  const isAuthPage = pathname === "/login";

  // If already authenticated and hitting the login page → go to dashboard
  if (isAuthPage && authToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Only run on /login — the admin layout handles its own client-side
     * route protection so we avoid complex server-side auth logic here.
     */
    "/login",
  ],
};
