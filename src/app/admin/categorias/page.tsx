'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { BASE_URL } from '@/lib/api';

type Categoria = {
  id: number;
  nombre: string;
  img: string | null;
  color: string | null;
  reservable: boolean;
};

type CreateBody = { nombre: string; img?: string; color?: string; reservable?: boolean };
type UpdateBody = Partial<CreateBody>;


export default function CategoriasAdminPage() {
  const [data, setData] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [fReservable, setFReservable] = useState(false);


  // modal
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [current, setCurrent] = useState<Categoria | null>(null);

  // form
  const [fNombre, setFNombre] = useState('');
  const [fImg, setFImg] = useState('');
  const [fColor, setFColor] = useState('');

  const resetForm = () => {
  setFNombre('');
  setFImg('');
  setFColor('');
  setFReservable(false);
};
  const closeModal = () => {
    setOpen(false);
    setErr(null);
    resetForm();
    setCurrent(null);
  };

  const handleCreateClick = () => {
  setMode('create');
  setCurrent(null);
  resetForm();
  setErr(null);
  setOpen(true);
};

  const handleEditClick = (cat: Categoria) => {
  setMode('edit');
  setCurrent(cat);
  setErr(null);
  setFNombre(cat.nombre);
  setFImg(cat.img ?? '');
  setFColor(cat.color ?? '');
  setFReservable(cat.reservable);   // 👈 importante
  setOpen(true);
};

  const fetchAll = async (signal?: AbortSignal) => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`${BASE_URL}/categorias`, { cache: 'no-store', signal });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error((json && (json.message || json.error)) || `HTTP ${res.status}`);
      setData(json as Categoria[]);
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      const msg = e instanceof Error ? e.message : 'Error al cargar categorías';
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ac = new AbortController();
    fetchAll(ac.signal);
    return () => ac.abort();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return data;
    return data.filter((c) => {
      const s = [
        String(c.id),
        c.nombre,
        c.img ?? '',
        c.color ?? '',
        c.reservable ? 'reservable' : 'no reservable',
      ]
        .join(' ')
        .toLowerCase();
      return s.includes(term);
    });
  }, [q, data]);

  const isValidHex = (v: string) => /^#([0-9A-Fa-f]{6})$/.test(v);
  const isValidUrl = (v: string) => {
    if (!v) return true;
    try {
      new URL(v);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async () => {
    setErr(null);

    if (!fNombre.trim()) return setErr('El nombre es obligatorio');
    if (fImg && !isValidUrl(fImg)) return setErr('img debe ser una URL válida');
    if (fColor && !isValidHex(fColor)) return setErr('color debe tener el formato #RRGGBB');

   const body: CreateBody | UpdateBody = {
  nombre: fNombre.trim(),
  img: fImg.trim() || undefined,
  color: fColor.trim() || undefined,
  reservable: fReservable,
};


    const editing = mode === 'edit' && current;
    const url = editing ? `${BASE_URL}/categorias/${current!.id}` : `${BASE_URL}/categorias`;
    const method = editing ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error((json && (json.message || json.error)) || `HTTP ${res.status}`);
      await fetchAll();
      closeModal();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'No se pudo guardar';
      setErr(msg);
    }
  };

  const handleDelete = async (cat: Categoria) => {
    if (!confirm(`¿Eliminar la categoría "${cat.nombre}"?`)) return;
    try {
      const res = await fetch(`${BASE_URL}/categorias/${cat.id}`, { method: 'DELETE' });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error((json && (json.message || json.error)) || `HTTP ${res.status}`);
      setData((prev) => prev.filter((x) => x.id !== cat.id));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'No se pudo eliminar';
      alert(msg);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Categorías</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Gestiona las categorías y su información.</p>
          </div>

          {/* Toolbar */}
          <div className="flex w-full gap-2 sm:w-auto sm:items-center">
            <div className="relative flex-1 sm:w-72 sm:flex-none">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar (nombre, color, URL…) "
                className="w-full rounded-xl border border-slate-200/70 bg-white/80 px-10 py-2 text-sm text-slate-800 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.2)] backdrop-blur-xl outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
              />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm8.707 13.293-3.387-3.387a9 9 0 1 0-1.414 1.414l3.387 3.387a1 1 0 0 0 1.414-1.414Z" />
                </svg>
              </span>
            </div>

            <button
              onClick={() => fetchAll()}
              className="rounded-xl border border-slate-200/70 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
              disabled={loading}
            >
              {loading ? 'Cargando…' : 'Recargar'}
            </button>

            <button
              onClick={handleCreateClick}
              className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
            >
              Nueva
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
                  <Th>Nombre</Th>
                  <Th>Imagen</Th>
                  <Th>Color</Th>
                  <Th>Reservable</Th>
                  <Th className="text-right">Acciones</Th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="p-6 text-center text-slate-500 dark:text-slate-400" colSpan={6}>
                      Cargando…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td className="p-10 text-center text-slate-500 dark:text-slate-400" colSpan={6}>
                      {q ? 'Sin resultados.' : 'Aún no hay categorías.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <CategoriaRow key={c.id} c={c} onDelete={handleDelete} onEdit={handleEditClick} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Modal Crear / Editar */}
      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm">
          <div className="flex min-h-full items-start justify-center p-4 sm:p-6">
            <div className="relative w-full max-w-xl rounded-3xl border border-slate-200/60 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900/95">
              {/* Header modal */}
              <div className="flex items-start justify-between border-b border-slate-100/80 px-6 py-4 dark:border-white/10">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-500">
                    {mode === 'edit' ? 'Editar categoría' : 'Nueva categoría'}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">
                    {mode === 'edit' && current ? current.nombre : 'Información de la categoría'}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Define el nombre, color e imagen opcional de la categoría.
                  </p>
                </div>
                

                <button
                  onClick={closeModal}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/70 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                  aria-label="Cerrar"
                >
                  <span className="text-lg leading-none">×</span>
                </button>
              </div>

              {/* Contenido */}
              <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-slate-300">
                      Nombre
                    </label>
                    <input
                      value={fNombre}
                      onChange={(e) => setFNombre(e.target.value)}
                      placeholder="Ej. Relax & Salud"
                      className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-slate-300">
                      Imagen (URL)
                    </label>
                    <input
                      value={fImg}
                      onChange={(e) => setFImg(e.target.value)}
                      placeholder="https://…"
                      className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                    />
                    {fImg && isValidUrl(fImg) && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-600 dark:text-slate-300">
                        <span className="relative block h-12 w-12 overflow-hidden rounded border border-slate-200/70 dark:border-white/10">
                          <Image src={fImg} alt="preview" fill sizes="48px" className="object-cover" />
                        </span>
                        <span>Vista previa</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-slate-300">
                      Color (#RRGGBB)
                    </label>
                    <input
                      value={fColor}
                      onChange={(e) => setFColor(e.target.value)}
                      placeholder="#FF9900"
                      className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                    />
                    {fColor && isValidHex(fColor) && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-600 dark:text-slate-300">
                        <span
                          className="h-4 w-4 rounded border border-black/10 dark:border-white/30"
                          style={{ backgroundColor: fColor }}
                        />
                        <span>Vista previa</span>
                      </div>
                    )}
                  </div>
                  <div>
  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-slate-300">
    Reservable
  </label>
  <div className="flex items-center gap-3">
    <button
      type="button"
      onClick={() => setFReservable((v) => !v)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        fReservable ? 'bg-emerald-500/90' : 'bg-slate-500/60'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          fReservable ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
    <span className="text-xs text-slate-600 dark:text-slate-300">
      {fReservable ? 'Sí, se puede reservar' : 'No, solo informativa'}
    </span>
  </div>
</div>

                </div>

                {err && (
                  <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
                    {err}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-3 border-t border-slate-100/80 bg-slate-50/70 px-6 py-4 text-xs dark:border-white/10 dark:bg-slate-900/80">
                <p className="hidden text-slate-500 dark:text-slate-400 sm:block">
                  Revisa los datos antes de guardar. Podrás editarlos después.
                </p>
                <div className="ml-auto flex gap-2">
                  <button
                    onClick={closeModal}
                    className="rounded-lg border border-slate-200/80 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/10"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* UI helpers */

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
function Badge({ children, color = 'slate' }: { children: React.ReactNode; color?: 'green' | 'slate' }) {
  const schemes: Record<'green' | 'slate', string> = {
    green:
      'bg-emerald-100 text-emerald-700 border-emerald-200/70 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-800',
    slate:
      'bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800/70 dark:text-slate-100 dark:border-slate-600',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${schemes[color]}`}
    >
      {children}
    </span>
  );
}

function ActionButton({
  onClick,
  children,
  variant = 'ghost',
}: {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'ghost' | 'danger' | 'primary' | 'ghostWhite';
}) {
  const stylesMap: Record<'primary' | 'danger' | 'ghost' | 'ghostWhite', string> = {
    primary: 'bg-sky-600 text-white hover:bg-sky-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost:
      'border hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border-slate-200/70 dark:border-white/10',
    ghostWhite: 'border border-white/30 text-white hover:bg-white/10',
  };

  return (
    <button onClick={onClick} className={`rounded-xl px-3 py-1.5 text-xs font-medium ${stylesMap[variant]}`}>
      {children}
    </button>
  );
}

function CategoriaRow({
  c,
  onDelete,
  onEdit,
}: {
  c: Categoria;
  onDelete: (c: Categoria) => void;
  onEdit: (c: Categoria) => void;
}) {
  return (
    <tr className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/70">
      <Td className="text-slate-500 dark:text-slate-400">{c.id}</Td>
      <Td className="font-medium text-slate-800 dark:text-slate-100">{c.nombre}</Td>
      <Td>
        {c.img ? (
          <a href={c.img} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3">
            <span className="relative block h-10 w-10 overflow-hidden rounded-md border dark:border-white/10">
              <Image src={c.img} alt={c.nombre} fill sizes="40px" className="object-cover" />
            </span>
            <span className="text-sky-700 hover:underline dark:text-sky-300">{shorten(c.img)}</span>
          </a>
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </Td>
      <Td>
        {c.color ? (
          <span className="inline-flex items-center gap-2 text-slate-700 dark:text-white">
            <span className="h-4 w-4 rounded border border-black/10 dark:border-white/30" style={{ backgroundColor: c.color }} />
            <span className="font-medium tracking-wide">{c.color}</span>
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </Td>

      <Td>{c.reservable ? <Badge color="green">Sí</Badge> : <Badge>No</Badge>}</Td>
      <Td className="text-right">
        <div className="flex items-center justify-end gap-2">
          <ActionButton onClick={() => onEdit(c)} variant="ghost">
            Editar
          </ActionButton>

          <ActionButton onClick={() => onDelete(c)} variant="danger">
            Eliminar
          </ActionButton>
        </div>
      </Td>
    </tr>
  );
}

function shorten(url: string, max = 34) {
  if (url.length <= max) return url;
  const u = new URL(url);
  const base = `${u.hostname}${u.pathname}`;
  return base.length <= max ? base : base.slice(0, max - 1) + '…';
}
