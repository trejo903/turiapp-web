"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BASE_URL } from "@/lib/api";

function format(n: number | null | undefined) {
  if (typeof n !== "number") return "—";
  return new Intl.NumberFormat("es-MX").format(n);
}

export default function AdminHome() {
  const [users, setUsers] = useState<number | null>(null);
  const [cats, setCats] = useState<number | null>(null);
  const [sites, setSites] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();

    // intenta primero /usuarios/count-activos, si 404/500 cae a /usuarios/count
    const fetchUsers = async () => {
      try {
        const r1 = await fetch(`${BASE_URL}/usuarios/count-activos`, { signal: ac.signal });
        if (r1.ok) {
          const d = await r1.json();
          setUsers(Number(d.total ?? 0));
          return;
        }
        // fallback
        const r2 = await fetch(`${BASE_URL}/usuarios/count`, { signal: ac.signal });
        if (r2.ok) {
          const d = await r2.json();
          setUsers(Number(d.total ?? 0));
        } else {
          setUsers(null);
        }
      } catch {
        setUsers(null);
      }
    };

    const fetchCats = async () => {
      try {
        const r = await fetch(`${BASE_URL}/categorias/count`, { signal: ac.signal });
        if (!r.ok) throw 0;
        const d = await r.json();
        setCats(Number(d.total ?? 0));
      } catch {
        setCats(null);
      }
    };

    const fetchSites = async () => {
      try {
        const r = await fetch(`${BASE_URL}/sitios/count`, { signal: ac.signal });
        if (!r.ok) throw 0;
        const d = await r.json();
        setSites(Number(d.total ?? 0));
      } catch {
        setSites(null);
      }
    };

    (async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchCats(), fetchSites()]);
      setLoading(false);
    })();

    return () => ac.abort();
  }, []);

  const usersText = useMemo(() => (loading ? "…" : format(users)), [loading, users]);
  const catsText = useMemo(() => (loading ? "…" : format(cats)), [loading, cats]);
  const sitesText = useMemo(() => (loading ? "…" : format(sites)), [loading, sites]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Panel de administración
            </h1>

          </div>

           <button
  onClick={async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch { /* ignore */ }
    window.location.href = "/"; // o usa router.replace("/")
  }}
  className="rounded-xl cursor-pointer bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 transition"
>
  Cerrar sesión
</button>

          
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

          {/* Sitios */}
          <Link
            href="/admin/sitios"
            className="group rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.2)] backdrop-blur-xl transition hover:-translate-y-[2px] hover:shadow-lg dark:border-white/10 dark:bg-white/5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-fuchsia-600 text-white shadow-fuchsia-600/30 shadow-lg">
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

        {/* Widgets / métricas */}
        <section className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200/70 bg-white/70 p-4 text-sm dark:border-white/10 dark:bg-white/5">
            <p className="text-slate-500 dark:text-slate-400">Usuarios activos</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
              {usersText}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/70 bg-white/70 p-4 text-sm dark:border-white/10 dark:bg-white/5">
            <p className="text-slate-500 dark:text-slate-400">Categorías</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
              {catsText}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/70 bg-white/70 p-4 text-sm dark:border-white/10 dark:bg-white/5">
            <p className="text-slate-500 dark:text-slate-400">Sitios</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
              {sitesText}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
