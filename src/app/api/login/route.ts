// app/api/login/route.ts
import { BASE_URL } from "@/lib/api";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { correo, password } = await req.json();

    // Llama a tu API Nest (server to server)
    const r = await fetch(`${BASE_URL}/usuarios/login-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, password }),
      // No uses credentials aquí; es server→server
    });

    // Intenta parsear JSON de forma robusta
    let data: any = null;
    const text = await r.text();
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    if (!r.ok) {
      const message =
        data?.message ||
        data?.error ||
        (Array.isArray(data?.message) ? data.message[0] : undefined) ||
        "Error de login";
      return NextResponse.json({ message }, { status: r.status });
    }

    const token = data?.accessToken as string | undefined;
    if (!token) {
      return NextResponse.json({ message: "Token no recibido" }, { status: 500 });
    }

    // Seteamos cookie en el MISMO dominio del frontend
    const resp = NextResponse.json({ ok: true, user: data?.user ?? null });

    resp.cookies.set("access_token", token, {
      httpOnly: true,
      secure: true,        // en Vercel es HTTPS
      sameSite: "lax",     // mismo sitio; funciona con navegación normal
      path: "/",
      maxAge: 60 * 60,     // 1h en segundos
    });

    return resp;
  } catch (err) {
    return NextResponse.json(
      { message: "No se pudo procesar el login" },
      { status: 500 }
    );
  }
}
