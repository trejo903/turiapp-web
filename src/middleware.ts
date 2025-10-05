// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/admin/:path*", "/", "/login"], // protegemos admin, home y login
};

export function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  const { pathname, searchParams } = req.nextUrl;

  // 1) /admin sin token -> pedir correo ("/") y guardamos next
  if (pathname.startsWith("/admin") && !token) {
    const url = new URL("/", req.url);
    url.searchParams.set("next", pathname + (req.nextUrl.search || ""));
    return NextResponse.redirect(url);
  }

  // 2) Si ya hay token y entra a "/" o "/login" -> mándalo a /admin
  if ((pathname === "/" || pathname === "/login") && token) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // 3) Si alguien entra directo a /login sin email/userId -> vuelve a "/"
  if (
    pathname === "/login" &&
    !searchParams.get("email") && // o exigir ambos si quieres: !searchParams.get("userId")
    !token
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}
