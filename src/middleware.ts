import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/dashboard", "/lesson", "/profile", "/cheatsheet"];
const ONBOARDING = ["/onboarding"];
const BASICS_PATH = "/basics";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const path = req.nextUrl.pathname;

  const isProtected = PROTECTED.some((p) => path.startsWith(p));
  const isOnboarding = ONBOARDING.some((p) => path.startsWith(p));
  const isBasics = path === BASICS_PATH || path.startsWith(BASICS_PATH + "/");

  // Not logged in → landing
  if (!token && (isProtected || isBasics)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Logged in + no track → onboarding
  if (token && !token.projectPath && (isProtected || isBasics)) {
    return NextResponse.redirect(new URL("/onboarding/experience", req.url));
  }

  // Logged in + has track → skip onboarding
  if (token && token.projectPath && isOnboarding) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  const basicsComplete = req.cookies.get("ga-basics")?.value === "1";

  // Logged in + has track + hasn't done basics → force /basics (but allow /basics itself)
  if (token && token.projectPath && !basicsComplete && isProtected) {
    return NextResponse.redirect(new URL(BASICS_PATH, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/lesson/:path*",
    "/profile/:path*",
    "/cheatsheet/:path*",
    "/hello-genlayer",
    "/hello-genlayer/:path*",
    "/onboarding/:path*",
    "/basics",
    "/basics/:path*",
  ],
};
