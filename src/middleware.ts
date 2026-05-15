import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/dashboard", "/lesson", "/profile", "/cheatsheet"];
const ONBOARDING = ["/onboarding"];
const HELLO_PATH = "/hello-genlayer";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const path = req.nextUrl.pathname;

  const isProtected = PROTECTED.some((p) => path.startsWith(p));
  const isOnboarding = ONBOARDING.some((p) => path.startsWith(p));
  const isHello = path.startsWith(HELLO_PATH);

  // Not logged in → send to landing
  if (!token && (isProtected || isHello)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Logged in but no track chosen → onboarding
  if (token && !token.projectPath && isProtected) {
    return NextResponse.redirect(new URL("/onboarding/experience", req.url));
  }

  // Logged in with track → skip onboarding
  if (token && token.projectPath && isOnboarding) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  const helloComplete = req.cookies.get("ga-hello")?.value === "1";

  // Logged in with track but haven't done hello → force hello
  if (token && token.projectPath && !helloComplete && isProtected) {
    return NextResponse.redirect(new URL(HELLO_PATH, req.url));
  }

  // Already done hello → skip hello page
  if (token && token.projectPath && helloComplete && isHello) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/lesson/:path*",
    "/profile/:path*",
    "/cheatsheet/:path*",
    "/onboarding/:path*",
    "/hello-genlayer/:path*",
    "/hello-genlayer",
  ],
};
