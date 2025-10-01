"use client";

import Link from "next/link";

export default function AdminHome() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Panel de administración
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Elige una sección para gestionar tu contenido.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-xl border border-slate-300/60 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
          >
            Ir al sitio
          </Link>
        </header>

        {/* Acciones principales */}
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Usuarios */}
          <Link
            href="/admin/usuarios"
            className="group rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.2)] backdrop-blur-xl transition hover:-translate-y-[2px] hover:shadow-lg dark:border-white/10 dark:bg-white/5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sky-600/30 shadow-lg">
                  {/* Icono usuarios */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                    <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm-7 8a7 7 0 0 1 14 0 1 1 0 0 1-1 1H6a1 1 0 0 1-1-1Z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 group-hover:underline dark:text-slate-100">
                    Usuarios
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Crear, editar y administrar cuentas de usuarios.
                  </p>
                </div>
              </div>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 transition group-hover:bg-slate-50 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
                Entrar →
              </span>
            </div>
          </Link>

          {/* Categorías */}
          <Link
            href="/admin/categorias"
            className="group rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.2)] backdrop-blur-xl transition hover:-translate-y-[2px] hover:shadow-lg dark:border:white/10 dark:bg-white/5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-emerald-600/30 shadow-lg">
                  {/* Icono categorías */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 7a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Zm12 0a4 4 0 0 1 4-4h2v2a4 4 0 0 1-4 4h-2ZM3 15h2a4 4 0 0 1 4 4v2H7a4 4 0 0 1-4-4Zm16 0a4 4 0 0 1 4 4v2h-2a4 4 0 0 1-4-4v-2Z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 group-hover:underline dark:text-slate-100">
                    Categorías
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Gestiona categorías y su organización.
                  </p>
                </div>
              </div>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 transition group-hover:bg-slate-50 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
                Entrar →
              </span>
            </div>
          </Link>

          {/* Sitios (nuevo) */}
          <Link
            href="/admin/sitios"
            className="group rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.2)] backdrop-blur-xl transition hover:-translate-y-[2px] hover:shadow-lg dark:border-white/10 dark:bg-white/5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-fuchsia-600 text-white shadow-fuchsia-600/30 shadow-lg">
                  {/* Icono sitios (pin/mapa) */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2a7 7 0 0 0-7 7c0 4.418 7 13 7 13s7-8.582 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 group-hover:underline dark:text-slate-100">
                    Sitios
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Administra los sitios y su información.
                  </p>
                </div>
              </div>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 transition group-hover:bg-slate-50 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
                Entrar →
              </span>
            </div>
          </Link>
        </section>

        {/* (Opcional) mini widgets / métricas */}
        <section className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200/70 bg-white/70 p-4 text-sm dark:border-white/10 dark:bg-white/5">
            <p className="text-slate-500 dark:text-slate-400">Usuarios activos</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">—</p>
          </div>
          <div className="rounded-xl border border-slate-200/70 bg-white/70 p-4 text-sm dark:border-white/10 dark:bg-white/5">
            <p className="text-slate-500 dark:text-slate-400">Categorías</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">—</p>
          </div>
          <div className="rounded-xl border border-slate-200/70 bg-white/70 p-4 text-sm dark:border-white/10 dark:bg-white/5">
            <p className="text-slate-500 dark:text-slate-400">Último acceso</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">—</p>
          </div>
        </section>
      </div>
    </main>
  );
}
