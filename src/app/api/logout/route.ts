// app/api/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  // (Opcional) si quieres avisar al backend para auditar/inactivar, haz un fetch aquí.
  const resp = NextResponse.json({ ok: true });
  resp.cookies.set("access_token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0, // elimina la cookie
  });
  return resp;
}
