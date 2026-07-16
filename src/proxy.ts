import { type NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE } from "@/lib/auth-constants";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const isAuthRoute = pathname.startsWith("/auth");
  const isPosRoute = pathname.startsWith("/pos");

  if (!token && isPosRoute) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/pos", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/pos/:path*", "/auth/:path*"],
};
