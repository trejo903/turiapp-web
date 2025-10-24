// app/api/login/route.ts
import { BASE_URL } from "@/lib/api";
import { NextResponse } from "next/server";

type ApiLoginSuccess = {
  user?: {
    id: number;
    correo: string;
    nombre?: string | null;
    apellido?: string | null;
  } | null;
  accessToken: string;
};

type ApiLoginError = {
  message?: string | string[];
  error?: string;
  raw?: string;
};

function safeParseJson<T>(text: string): T | null {
  try {
    return text ? (JSON.parse(text) as T) : null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { correo, password } = (await req.json()) as {
      correo: string;
      password: string;
    };

    const r = await fetch(`${BASE_URL}/usuarios/login-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, password }),
    });

    const text = await r.text();

    // Error HTTP desde el backend
    if (!r.ok) {
      const data = safeParseJson<ApiLoginError>(text) ?? { raw: text };
      const msgFromArray =
        Array.isArray(data.message) ? data.message[0] : data.message;
      const message = msgFromArray || data.error || data.raw || "Error de login";
      return NextResponse.json({ message }, { status: r.status });
    }

    // Éxito: esperamos { accessToken, user }
    const data = safeParseJson<ApiLoginSuccess>(text);
    const token = data?.accessToken;

    if (!token) {
      return NextResponse.json({ message: "Token no recibido" }, { status: 500 });
    }

    const resp = NextResponse.json({ ok: true, user: data?.user ?? null });

    resp.cookies.set("access_token", token, {
      httpOnly: true,
      secure: true,    // en Vercel siempre HTTPS
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1h (segundos)
    });

    return resp;
  } catch {
    return NextResponse.json(
      { message: "No se pudo procesar el login" },
      { status: 500 }
    );
  }
}
