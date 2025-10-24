"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { BASE_URL } from "@/lib/api";

type FormValues = { password: string };

// Error tipado para propagar status HTTP sin usar `any`
class HttpError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export default function NextLogin() {
  const router = useRouter();
  const search = useSearchParams();
  const email = search.get("email") ?? "";
  const userId = search.get("userId") ?? "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, isDirty },
    clearErrors,
    watch,
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: { password: "" },
  });

  const pwd = watch("password");
  const [serverError, setServerError] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  const friendlyMessage = (status?: number, messageFromServer?: string) => {
    if (status === 401) return "Credenciales inválidas. Verifica tu contraseña.";
    if (status === 403) return "No tienes permisos para continuar.";
    if (status === 404) return "No encontramos tu cuenta. Vuelve a ingresar el correo.";
    if (status === 400 || status === 422) return "Datos inválidos. Revisa la información.";
    if (status && status >= 500) return "Tuvimos un problema en el servidor. Intenta más tarde.";
    return messageFromServer || "No pudimos iniciar sesión. Intenta de nuevo.";
  };

  const onSubmit = async ({ password }: FormValues) => {
    setServerError(null);
    try {
      const res = await fetch(`${BASE_URL}/usuarios/login-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: email, password }),
        credentials: "include",
      });

      if (!res.ok) {
        let bodyText = "";
        let messageFromServer: string | undefined;
        try {
          bodyText = await res.text();
          try {
            const asJson = JSON.parse(bodyText) as {
              message?: string | string[];
              error?: string;
            };
            messageFromServer =
              (Array.isArray(asJson?.message) ? asJson.message[0] : asJson?.message) ??
              asJson?.error;
          } catch {
            messageFromServer = bodyText;
          }
        } catch {
          /* ignore */
        }
        throw new HttpError(friendlyMessage(res.status, messageFromServer), res.status);
      }

      router.replace("/admin");
    } catch (e: unknown) {
      const status = e instanceof HttpError ? e.status : undefined;
      const message = e instanceof Error ? e.message : String(e ?? "");
      setServerError(friendlyMessage(status, message));
    }
  };

  // Usa onChange dentro de register para no romper RHF
  const passwordRegister = register("password", {
    required: "La contraseña es obligatoria",
    minLength: { value: 8, message: "Mínimo 8 caracteres" },
    onChange: () => {
      if (serverError) setServerError(null);
      if (errors.password) clearErrors("password");
    },
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-md px-4 sm:px-6 pt-16">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Ingresa tu contraseña
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{email || "Correo no especificado"}</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.2)] dark:border-white/10 dark:bg-white/5">
          <div className="p-6 sm:p-7">
            {/* Banner de error */}
            {serverError && (
              <div
                role="alert"
                className="mb-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300"
              >
                <svg className="mt-[2px] h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11 7h2v6h-2V7Zm0 8h2v2h-2v-2Zm1-13a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z" />
                </svg>
                <div className="flex-1">{serverError}</div>
                <button
                  type="button"
                  onClick={() => setServerError(null)}
                  className="rounded-md px-2 py-1 text-xs text-rose-700 hover:bg-rose-100/60 dark:text-rose-300 dark:hover:bg-rose-900/30"
                >
                  Cerrar
                </button>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-800 dark:text-slate-200">
                  Contraseña
                </label>
                <div
                  className={[
                    "flex h-11 items-center rounded-xl border px-3",
                    "bg-white dark:bg-transparent",
                    serverError
                      ? "border-rose-500 ring-2 ring-rose-100 dark:ring-rose-900/40"
                      : "border-slate-300/70 focus-within:ring-2 focus-within:ring-blue-200 dark:border-white/15 dark:focus-within:ring-blue-900/40",
                  ].join(" ")}
                >
                  <input
                    type={show ? "text" : "password"}
                    placeholder="********"
                    className="w-full bg-transparent outline-none
                               text-slate-900 dark:text-white
                               placeholder:text-slate-400 dark:placeholder:text-slate-500
                               caret-blue-500"
                    {...passwordRegister}
                    aria-invalid={!!serverError || !!errors.password}
                    aria-describedby={
                      errors.password ? "password-error" : serverError ? "password-server-error" : undefined
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.currentTarget.form?.requestSubmit();
                    }}
                  />
                  <button
                    type="button"
                    className="ml-2 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    onClick={() => setShow((s) => !s)}
                    aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {show ? "Ocultar" : "Mostrar"}
                  </button>
                </div>

                {errors.password && (
                  <p id="password-error" className="mt-1.5 text-sm text-rose-600 dark:text-rose-400">
                    {errors.password.message}
                  </p>
                )}
                {!errors.password && serverError && (
                  <p id="password-server-error" className="mt-1.5 text-sm text-rose-600 dark:text-rose-400">
                    {serverError}
                  </p>
                )}
              </div>

              {/* Habilitar cuando: hay email, el form es válido y el usuario escribió algo */}
              <button
                disabled={!email || !isDirty || !isValid || isSubmitting || (pwd?.length ?? 0) < 8}
                className="group relative inline-flex h-11 w-full items-center justify-center overflow-hidden rounded-xl bg-blue-600 px-4 font-semibold text-white transition enabled:hover:shadow-lg enabled:hover:shadow-blue-600/30 disabled:opacity-60"
                type="submit"
              >
                {isSubmitting && (
                  <svg className="absolute left-4 h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"/>
                  </svg>
                )}
                <span className="transition group-enabled:group-hover:-translate-y-[1px]">
                  {isSubmitting ? "Validando..." : "Entrar"}
                </span>
              </button>

              <input type="hidden" value={userId} readOnly />
            </form>

            <div className="mt-3 text-center">
              <Link href="/" className="text-sm text-slate-600 hover:underline dark:text-slate-400">
                Usar otro correo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
