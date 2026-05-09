import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const deployMode = process.env.DEPLOY_MODE;
  const { pathname } = request.nextUrl;

  // Admin deployment: only allow /admin routes, redirect everything else to /admin
  if (deployMode === "admin") {
    if (pathname.startsWith("/admin")) {
      return NextResponse.next();
    }
    if (pathname === "/api/upload") {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Public deployment: block all /admin and /api routes
  if (!deployMode || deployMode === "public") {
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/upload")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|sitemap.xml|rss.xml).*)"],
};
