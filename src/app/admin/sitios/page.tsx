'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { BASE_URL } from '@/lib/api';

type Sitio = {
  id: number;
  nombre: string;
  img: string;
  telefono: string;
  estado: string;
  municipio: string;
  cp: string;
  fraccionamiento: string;
  calle: string;
  // columnas DECIMAL a veces llegan como string
  latitude: number | string;
  longitude: number | string;
  categoriaId: number;
};

type Categoria = { id: number; nombre: string };

export default function SitiosAdminPage() {
  const [data, setData] = useState<Sitio[]>([]);
  const [cats, setCats] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [catFilter, setCatFilter] = useState<number | 'all'>('all');

  const fetchAll = async (signal?: AbortSignal) => {
    setLoading(true);
    setErr(null);
    try {
      const qs = catFilter === 'all' ? '' : `?categoriaId=${encodeURIComponent(catFilter)}`;
      const res = await fetch(`${BASE_URL}/sitios${qs}`, { cache: 'no-store', signal });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error((json && (json.message || json.error)) || `HTTP ${res.status}`);
      setData(json as Sitio[]);
    } catch (e: unknown) {
      // ignora AbortError
      if (e instanceof DOMException && e.name === 'AbortError') return;
      const message = e instanceof Error ? e.message : 'Error al cargar sitios';
      setErr(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCats = async (signal?: AbortSignal) => {
    try {
      const res = await fetch(`${BASE_URL}/categorias`, { cache: 'no-store', signal });
      const json = await res.json().catch(() => null);
      if (res.ok && Array.isArray(json)) setCats(json as Categoria[]);
    } catch {
      /* noop */
    }
  };

  useEffect(() => {
    const ac = new AbortController();
    fetchCats(ac.signal);
    fetchAll(ac.signal);
    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    fetchAll(ac.signal);
    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catFilter]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return data;
    return data.filter((s) => {
      const texto = [
        String(s.id),
        s.nombre,
        s.telefono,
        s.estado,
        s.municipio,
        s.cp,
        s.fraccionamiento,
        s.calle,
        s.img,
        String(s.latitude),
        String(s.longitude),
        s.categoriaId,
      ]
        .join(' ')
        .toLowerCase();
      return texto.includes(term);
    });
  }, [q, data]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Sitios</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Consulta y filtra los sitios registrados.</p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:w-72 sm:flex-none">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar (nombre, teléfono, dirección…)"
                className="w-full rounded-xl border border-slate-200/70 bg-white/80 px-10 py-2 text-sm text-slate-800 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.2)] backdrop-blur-xl outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
              />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm8.707 13.293-3.387-3.387a9 9 0 1 0-1.414 1.414l3.387 3.387a1 1 0 0 0 1.414-1.414Z" />
                </svg>
              </span>
            </div>

            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm text-slate-800 shadow-sm outline-none focus:ring-2 focus:ring-sky-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
            >
              <option value="all">Todas las categorías</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>

            <button
              onClick={() => fetchAll()}
              className="rounded-xl border border-slate-200/70 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
              disabled={loading}
            >
              {loading ? 'Cargando…' : 'Recargar'}
            </button>
          </div>
        </header>

        {err && (
          <div className="mb-4 rounded-xl border border-red-300/60 bg-red-50/80 px-4 py-3 text-sm text-red-800 shadow-sm dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
            {err}
          </div>
        )}

        <section className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.2)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-slate-50/70 text-left dark:bg-white/5">
                <tr>
                  <Th>ID</Th>
                  <Th>Imagen</Th>
                  <Th>Nombre</Th>
                  <Th>Teléfono</Th>
                  <Th>Dirección</Th>
                  <Th>Coords</Th>
                  <Th>Cat.</Th>
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
                      {q ? 'Sin resultados.' : 'Aún no hay sitios.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => <SitioRow key={s.id} s={s} />)
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ---- UI helpers ---- */

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300 ${className}`}>
      {children}
    </th>
  );
}
function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`border-t border-slate-100/70 px-4 py-3 dark:border-white/10 ${className}`}>{children}</td>;
}

function fmtCoord(v: number | string, digits = 4) {
  const n = typeof v === 'number' ? v : parseFloat(v);
  return Number.isFinite(n) ? n.toFixed(digits) : '—';
}

function SitioRow({ s }: { s: Sitio }) {
  return (
    <tr className="hover:bg-slate-50/60 dark:hover:bg-white/5">
      <Td className="text-slate-500 dark:text-slate-400">{s.id}</Td>
      <Td>
        {s.img ? (
          <a href={s.img} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3">
            <span className="relative block h-10 w-10 overflow-hidden rounded-md border dark:border-white/10">
              <Image src={s.img} alt={s.nombre} fill sizes="40px" className="object-cover" />
            </span>
          </a>
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </Td>
      <Td className="font-medium text-slate-800 dark:text-slate-100">{s.nombre}</Td>
      <Td>
        <a href={`tel:${s.telefono}`} className="text-sky-700 hover:underline dark:text-sky-300">
          {s.telefono}
        </a>
      </Td>
      <Td className="text-slate-600 dark:text-slate-300">
        <span className="block">{s.calle}</span>
        <span className="block">{s.fraccionamiento}</span>
        <span className="block">
          {s.municipio}, {s.estado} {s.cp}
        </span>
      </Td>
      <Td className="text-slate-600 dark:text-slate-300">
        {fmtCoord(s.latitude)}, {fmtCoord(s.longitude)}
      </Td>
      <Td>
        <span className="rounded-full border border-slate-200/70 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
          {s.categoriaId}
        </span>
      </Td>
    </tr>
  );
}
