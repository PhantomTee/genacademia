import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/dashboard", "/lesson", "/profile", "/cheatsheet"];
const ONBOARDING = ["/onboarding"];

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const path = req.nextUrl.pathname;

  const isProtected = PROTECTED.some((p) => path.startsWith(p));
  const isOnboarding = ONBOARDING.some((p) => path.startsWith(p));

  if (!token && isProtected) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (token && !token.projectPath && isProtected && !isOnboarding) {
    return NextResponse.redirect(new URL("/onboarding/experience", req.url));
  }

  if (token && token.projectPath && isOnboarding) {
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
  ],
};
