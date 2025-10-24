'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { BASE_URL } from '@/lib/api';

type UsuarioRow = {
  id: number;
  correo: string;
  nombre: string | null;
  apellido: string | null;
  telefono: string | null;
  validado: boolean;
};

export default function UsuariosAdminPage() {
  const [data, setData] = useState<UsuarioRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState('');

  const fetchUsers = async (signal?: AbortSignal) => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`${BASE_URL}/usuarios`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        signal,
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Error HTTP ${res.status}`);
      }
      const json = (await res.json()) as UsuarioRow[];
      setData(json);
    } catch (e: unknown) {
      // Ignorar aborts silenciosamente
      if (e instanceof DOMException && e.name === 'AbortError') return;
      const message = e instanceof Error ? e.message : 'Error al cargar usuarios';
      setErr(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ac = new AbortController();
    fetchUsers(ac.signal);
    return () => ac.abort();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return data;
    return data.filter((u) => {
      const campos = [
        String(u.id),
        u.correo,
        u.nombre ?? '',
        u.apellido ?? '',
        u.telefono ?? '',
        u.validado ? 'validado' : 'no validado',
      ]
        .join(' ')
        .toLowerCase();
      return campos.includes(term);
    });
  }, [q, data]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Usuarios
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Administra las cuentas y verifica el estado de validación.
            </p>
          </div>

          {/* Toolbar */}
          <div className="flex w-full gap-2 sm:w-auto sm:items-center">
            <div className="relative flex-1 sm:w-72 sm:flex-none">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar (correo, nombre, teléfono...)"
                className="w-full rounded-xl border border-slate-200/70 bg-white/80 px-10 py-2 text-sm text-slate-800 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.2)] backdrop-blur-xl outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
              />
              {/* icono lupa */}
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm8.707 13.293-3.387-3.387a9 9 0 1 0-1.414 1.414l3.387 3.387a1 1 0 0 0 1.414-1.414Z" />
                </svg>
              </span>
            </div>

            <button
              onClick={() => fetchUsers()}
              className="rounded-xl border border-slate-200/70 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
              disabled={loading}
            >
              {loading ? 'Cargando…' : 'Recargar'}
            </button>
          </div>
        </header>

        {/* Error */}
        {err && (
          <div className="mb-4 rounded-xl border border-red-300/60 bg-red-50/80 px-4 py-3 text-sm text-red-800 shadow-sm dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
            {err}
          </div>
        )}

        {/* Card tabla */}
        <section className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.2)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-slate-50/70 text-left dark:bg-white/5">
                <tr>
                  <Th>ID</Th>
                  <Th>Correo</Th>
                  <Th>Nombre</Th>
                  <Th>Apellido</Th>
                  <Th>Teléfono</Th>
                  <Th>Validado</Th>
                  <Th className="text-right">Acciones</Th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td className="p-6 text-center text-slate-500 dark:text-slate-400" colSpan={7}>
                      Cargando…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td className="p-10 text-center text-slate-500 dark:text-slate-400" colSpan={7}>
                      {q ? 'No hay resultados para tu búsqueda.' : 'Aún no hay usuarios.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => <UsuarioRowItem key={u.id} u={u} />)
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

/* UI helpers */

function Th({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300 ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`border-t border-slate-100/70 px-4 py-3 dark:border-white/10 ${className}`}>{children}</td>;
}

function Badge({
  children,
  color = 'slate',
}: {
  children: React.ReactNode;
  color?: 'green' | 'amber' | 'slate';
}) {
  const schemes: Record<'green' | 'amber' | 'slate', string> = {
    green:
      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200 border-green-200/60 dark:border-green-900/50',
    amber:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200 border-amber-200/60 dark:border-amber-900/50',
    slate:
      'bg-slate-100 text-slate-700 dark:bg:white/10 dark:text-slate-200 border-slate-200/60 dark:border-white/10',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${schemes[color]}`}>
      {children}
    </span>
  );
}

function ActionLink({
  href,
  children,
  variant = 'ghost',
}: {
  href: string;
  children: React.ReactNode;
  variant?: 'ghost' | 'primary';
}) {
  const styles =
    variant === 'primary'
      ? 'bg-sky-600 text-white hover:bg-sky-700'
      : 'border hover:bg-slate-50 dark:hover:bg-white/10';
  return (
    <Link
      href={href}
      className={`rounded-xl px-3 py-1.5 text-xs font-medium ${styles} border-slate-200/70 dark:border-white/10`}
    >
      {children}
    </Link>
  );
}

function UsuarioRowItem({ u }: { u: UsuarioRow }) {
  return (
    <tr className="hover:bg-slate-50/60 dark:hover:bg-white/5">
      <Td className="text-slate-500 dark:text-slate-400">{u.id}</Td>
      <Td>
        <div className="font-medium text-slate-800 dark:text-slate-100">{u.correo}</div>
      </Td>
      <Td className="text-slate-700 dark:text-slate-200">
        {u.nombre ?? <span className="text-slate-400">—</span>}
      </Td>
      <Td className="text-slate-700 dark:text-slate-200">
        {u.apellido ?? <span className="text-slate-400">—</span>}
      </Td>
      <Td className="text-slate-700 dark:text-slate-200">
        {u.telefono ?? <span className="text-slate-400">—</span>}
      </Td>
      <Td>
        {u.validado ? <Badge color="green">Sí</Badge> : <Badge color="amber">No</Badge>}
      </Td>
      <Td className="text-right">
        <div className="flex items-center justify-end gap-2">
          <ActionLink href={`/admin/usuarios/${u.id}`}>Ver</ActionLink>
          <ActionLink href={`/admin/usuarios/${u.id}/editar`} variant="primary">
            Editar
          </ActionLink>
        </div>
      </Td>
    </tr>
  );
}
