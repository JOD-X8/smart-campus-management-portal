import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
 process.env.JWT_SECRET || "smart-campus-management-super-secret-key-prod-2024"
);

const AUTH_COOKIE = "smart_campus_session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip static files, images, and public api
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon.ico") ||
    pathname === "/api/auth/login"
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(AUTH_COOKIE)?.value;
  let user: { id: string; email: string; role: string } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      user = payload as unknown as { id: string; email: string; role: string };
    } catch {
      user = null;
    }
  }

  // If user is accessing login while already authenticated, redirect to their role dashboard
  if (pathname === "/login") {
    if (user) {
      if (user.role === "ADMIN") return NextResponse.redirect(new URL("/admin", req.url));
      if (user.role === "FACULTY") return NextResponse.redirect(new URL("/faculty", req.url));
      return NextResponse.redirect(new URL("/student", req.url));
    }
    return NextResponse.next();
  }

  // Root path redirect
  if (pathname === "/") {
    if (!user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (user.role === "ADMIN") return NextResponse.redirect(new URL("/admin", req.url));
    if (user.role === "FACULTY") return NextResponse.redirect(new URL("/faculty", req.url));
    return NextResponse.redirect(new URL("/student", req.url));
  }

  // Protected application routes
  const protectedPrefixes = [
    "/admin",
    "/faculty",
    "/student",
    "/students",
    "/faculty-dir",
    "/courses",
    "/departments",
    "/attendance",
    "/grades",
    "/timetable",
    "/assignments",
    "/announcements",
    "/notifications",
    "/ai-assistant",
    "/settings",
  ];

  const isProtectedRoute = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (isProtectedRoute) {
    if (!user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-specific route guards
    if (pathname.startsWith("/admin") && user.role !== "ADMIN") {
      const fallback = user.role === "FACULTY" ? "/faculty" : "/student";
      return NextResponse.redirect(new URL(fallback, req.url));
    }

    if (
  (pathname === "/faculty" || pathname.startsWith("/faculty/")) &&
  user.role !== "FACULTY" &&
  user.role !== "ADMIN"
) {
  return NextResponse.redirect(new URL("/student", req.url));
}

if (
  (pathname === "/student" || pathname.startsWith("/student/")) &&
  user.role !== "STUDENT" &&
  user.role !== "ADMIN"
) {
  return NextResponse.redirect(new URL("/faculty", req.url));
}
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
