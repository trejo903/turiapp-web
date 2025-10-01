"use client";

import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BASE_URL } from "@/lib/api";

type FormValues = { email: string };

type LoginStartResp = {
  id: number | string;
  correo: string;
  nombre: string | null;
  apellido: string | null;
  telefono: string | null;
  validado: boolean;
  nextStep: "crear-password" | "informacion" | "ultimo" | "password-check";
};

export default function Usuario() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: { email: "" },
  });

  // Mapea status -> mensajes amigables
  const friendlyMessage = (status?: number, text?: string) => {
    if (status === 404)
      return "No encontramos una cuenta con ese correo. Revísalo o crea una cuenta nueva.";
    if (status === 409)
      return "Ese correo ya está registrado. Intenta iniciar sesión.";
    if (status === 400 || status === 422)
      return "El formato del correo no es válido. Corrígelo e inténtalo de nuevo.";
    if (status === 401 || status === 403)
      return "No tienes permisos para continuar. Verifica tus datos.";
    if (status && status >= 500)
      return "Tuvimos un problema en el servidor. Intenta más tarde.";
    // fallback al texto del backend si viene legible
    return text || "No pudimos continuar. Intenta de nuevo.";
  };

  const onSubmit = async ({ email }: FormValues) => {
    setServerError(null);
    try {
      const res = await fetch(`${BASE_URL}/usuarios/login-start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: email }),
      });

      if (!res.ok) {
        // intenta leer JSON y tomar su message; si no, usa texto plano
        let bodyText = "";
        let messageFromServer: string | undefined;
        try {
          bodyText = await res.text();
          try {
            const asJson = JSON.parse(bodyText);
            messageFromServer =
              (Array.isArray(asJson?.message)
                ? asJson.message[0]
                : asJson?.message) || asJson?.error;
          } catch {
            messageFromServer = bodyText;
          }
        } catch {
          /* ignore */
        }
        const msg = friendlyMessage(res.status, messageFromServer);
        const err = new Error(msg) as any;
        err.status = res.status;
        throw err;
      }

      const body: LoginStartResp = await res.json();
      const userId = String(body.id);

      switch (body.nextStep) {
        case "crear-password":
          router.replace(
            `/usuario/crearcuenta/password?userId=${encodeURIComponent(
              userId
            )}&email=${encodeURIComponent(body.correo)}`
          );
          break;
        case "informacion":
          router.replace(
            `/usuario/crearcuenta/informacion?userId=${encodeURIComponent(
              userId
            )}&email=${encodeURIComponent(
              body.correo
            )}&nombre=${encodeURIComponent(
              body.nombre ?? ""
            )}&apellido=${encodeURIComponent(body.apellido ?? "")}`
          );
          break;
        case "ultimo":
          router.replace(
            `/usuario/crearcuenta/ultimo?userId=${encodeURIComponent(
              userId
            )}&email=${encodeURIComponent(
              body.correo
            )}&nombre=${encodeURIComponent(
              body.nombre ?? ""
            )}&apellido=${encodeURIComponent(body.apellido ?? "")}`
          );
          break;
        case "password-check":
          router.replace(
            `/login?userId=${encodeURIComponent(
              userId
            )}&email=${encodeURIComponent(body.correo)}`
          );
          break;
      }
    } catch (e: any) {
      const msg = friendlyMessage(e?.status, e?.message);
      // pinta el input y muestra banner
      setError("email", { type: "server", message: msg });
      setServerError(msg);
    }
  };

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
            Iniciar sesión
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Escribe tu correo para continuar con el proceso.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.2)] dark:border-white/10 dark:bg-white/5">
          <div className="p-6 sm:p-7">
            {/* Banner de error (opcional) */}
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
                  aria-label="Cerrar alerta"
                >
                  Cerrar
                </button>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Controller
                control={control}
                name="email"
                rules={{
                  required: "El correo electrónico es obligatorio",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Escribe un correo válido",
                  },
                }}
                render={({ field }) => (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-800 dark:text-slate-200">
                      Correo electrónico
                    </label>
                    <div
                      className={[
                        "flex h-11 items-center rounded-xl border px-3",
                        "bg-white dark:bg-transparent",
                        errors.email
                          ? "border-rose-500 ring-2 ring-rose-100 dark:ring-rose-900/40"
                          : "border-slate-300/70 focus-within:ring-2 focus-within:ring-blue-200 dark:border-white/15 dark:focus-within:ring-blue-900/40",
                      ].join(" ")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-2 h-4 w-4 text-slate-400 dark:text-slate-500"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M20 4H4a2 2 0 0 0-2 2v.4l10 6.25L22 6.4V6a2 2 0 0 0-2-2Zm0 5.15-8 5-8-5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9.15Z" />
                      </svg>
                      <input
                        {...field}
                        inputMode="email"
                        type="email"
                        placeholder="correo@gmail.com"
                        className="peer w-full bg-transparent outline-none
                                   text-slate-900 dark:text-white
                                   placeholder:text-slate-400 dark:placeholder:text-slate-500
                                   caret-blue-500"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                        onChange={(e) => {
                          field.onChange(e);
                          if (serverError) setServerError(null); // limpiar banner al escribir
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.currentTarget.form?.requestSubmit();
                        }}
                      />
                    </div>
                    {errors.email && (
                      <p id="email-error" className="mt-1.5 text-sm text-rose-600 dark:text-rose-400">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <button
                disabled={!isValid || isSubmitting}
                className="group relative inline-flex h-11 w-full items-center justify-center overflow-hidden rounded-xl bg-blue-600 px-4 font-semibold text-white transition enabled:hover:shadow-lg enabled:hover:shadow-blue-600/30 disabled:opacity-60"
                type="submit"
              >
                {isSubmitting && (
                  <svg
                    className="absolute left-4 h-5 w-5 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
                  </svg>
                )}
                <span className="transition group-enabled:group-hover:-translate-y-[1px]">
                  {isSubmitting ? "Enviando..." : "Continuar"}
                </span>
              </button>

              <div className="pt-1 text-center text-xs text-slate-500 dark:text-slate-400">
                Al continuar aceptas nuestro{" "}
                <a className="underline underline-offset-2 hover:text-slate-700 dark:hover:text-slate-300" href="#">
                  aviso de privacidad
                </a>
                .
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
