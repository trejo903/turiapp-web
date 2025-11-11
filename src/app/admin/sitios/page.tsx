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
  latitude: number | string;
  longitude: number | string;
  categoriaId: number;
};

type Categoria = { id: number; nombre: string };

type CreateBody = {
  nombre: string;
  img: string;
  telefono: string;
  estado: string;
  municipio: string;
  cp: string;
  fraccionamiento: string;
  calle: string;
  latitude: number;
  longitude: number;
  categoriaId: number;
};
type UpdateBody = Partial<CreateBody>;

export default function SitiosAdminPage() {
  const [data, setData] = useState<Sitio[]>([]);
  const [cats, setCats] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [catFilter, setCatFilter] = useState<number | 'all'>('all');

  // modal / crud
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [current, setCurrent] = useState<Sitio | null>(null);

  // form
  const [fNombre, setFNombre] = useState('');
  const [fImg, setFImg] = useState('');
  const [fTelefono, setFTelefono] = useState('');
  const [fEstado, setFEstado] = useState('');
  const [fMunicipio, setFMunicipio] = useState('');
  const [fCP, setFCP] = useState('');
  const [fFrac, setFFrac] = useState('');
  const [fCalle, setFCalle] = useState('');
  const [fLat, setFLat] = useState('');
  const [fLng, setFLng] = useState('');
  const [fCatId, setFCatId] = useState<number | ''>('');

  // paginación (client-side)
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const resetForm = () => {
    setFNombre('');
    setFImg('');
    setFTelefono('');
    setFEstado('');
    setFMunicipio('');
    setFCP('');
    setFFrac('');
    setFCalle('');
    setFLat('');
    setFLng('');
    setFCatId('');
  };

  const closeModal = () => {
    setOpen(false);
    resetForm();
    setErr(null);
    setCurrent(null);
  };

  const handleCreateClick = () => {
    setMode('create');
    setCurrent(null);
    resetForm();
    setErr(null);
    setOpen(true);
  };

  const handleEditClick = (s: Sitio) => {
    setMode('edit');
    setCurrent(s);
    setErr(null);
    setFNombre(s.nombre);
    setFImg(s.img ?? '');
    setFTelefono(s.telefono ?? '');
    setFEstado(s.estado ?? '');
    setFMunicipio(s.municipio ?? '');
    setFCP(s.cp ?? '');
    setFFrac(s.fraccionamiento ?? '');
    setFCalle(s.calle ?? '');
    setFLat(String(s.latitude ?? ''));
    setFLng(String(s.longitude ?? ''));
    setFCatId(s.categoriaId);
    setOpen(true);
  };

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
    setPage(1); // reset page al cambiar filtro de categoría
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
        String(s.categoriaId),
      ]
        .join(' ')
        .toLowerCase();
      return texto.includes(term);
    });
  }, [q, data]);

  // paginación client-side
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const paged = filtered.slice(startIdx, startIdx + pageSize);

  const handleSubmit = async () => {
    setErr(null);

    if (!fNombre.trim()) return setErr('El nombre es obligatorio');
    if (!fTelefono.trim()) return setErr('El teléfono es obligatorio');
    if (!fEstado.trim()) return setErr('El estado es obligatorio');
    if (!fMunicipio.trim()) return setErr('El municipio es obligatorio');
    if (!fCP.trim()) return setErr('El código postal es obligatorio');
    if (!fFrac.trim()) return setErr('El fraccionamiento es obligatorio');
    if (!fCalle.trim()) return setErr('La calle es obligatoria');
    if (!fCatId) return setErr('La categoría es obligatoria');

    const lat = Number(fLat);
    const lng = Number(fLng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return setErr('Latitud/longitud inválidas');
    }

    const body: CreateBody | UpdateBody = {
      nombre: fNombre.trim(),
      img: fImg.trim(),
      telefono: fTelefono.trim(),
      estado: fEstado.trim(),
      municipio: fMunicipio.trim(),
      cp: fCP.trim(),
      fraccionamiento: fFrac.trim(),
      calle: fCalle.trim(),
      latitude: lat,
      longitude: lng,
      categoriaId: fCatId as number,
    };

    const editing = mode === 'edit' && current;
    const url = editing ? `${BASE_URL}/sitios/${current!.id}` : `${BASE_URL}/sitios`;
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

  const handleDelete = async (s: Sitio) => {
    if (!confirm(`¿Eliminar el sitio "${s.nombre}"?`)) return;
    try {
      const res = await fetch(`${BASE_URL}/sitios/${s.id}`, { method: 'DELETE' });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error((json && (json.message || json.error)) || `HTTP ${res.status}`);
      setData((prev) => prev.filter((x) => x.id !== s.id));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'No se pudo eliminar';
      alert(msg);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Sitios</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Consulta, filtra y administra los sitios registrados.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:w-72 sm:flex-none">
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
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
  className="
    rounded-xl border px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-sky-500
    border-slate-200/70 bg-white/90 text-slate-800
    dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-50 dark:[color-scheme:dark]
  "
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

            <button
              onClick={handleCreateClick}
              className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
            >
              Nuevo sitio
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
                  <Th className="text-right">Acciones</Th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="p-6 text-center text-slate-500 dark:text-slate-400" colSpan={8}>
                      Cargando…
                    </td>
                  </tr>
                ) : paged.length === 0 ? (
                  <tr>
                    <td className="p-10 text-center text-slate-500 dark:text-slate-400" colSpan={8}>
                      {q ? 'Sin resultados.' : 'Aún no hay sitios.'}
                    </td>
                  </tr>
                ) : (
                  paged.map((s) => (
                    <SitioRow key={s.id} s={s} onEdit={handleEditClick} onDelete={handleDelete} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
            <span>
              Mostrando{' '}
              <strong>
                {filtered.length === 0 ? 0 : startIdx + 1}-{startIdx + paged.length}
              </strong>{' '}
              de <strong>{filtered.length}</strong> sitios
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="rounded-lg border border-slate-200/70 px-2 py-1 text-xs disabled:opacity-50 dark:border-white/10"
              >
                Anterior
              </button>
              <span>
                Página <strong>{safePage}</strong> de <strong>{totalPages}</strong>
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="rounded-lg border border-slate-200/70 px-2 py-1 text-xs disabled:opacity-50 dark:border-white/10"
              >
                Siguiente
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Modal Crear / Editar */}
            {/* Modal Crear / Editar */}
      {open && (
  <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm">
    <div className="flex min-h-full items-start justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-4xl rounded-3xl border border-slate-200/60 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900/95">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100/80 px-6 py-4 dark:border-white/10">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-500">
              {mode === 'edit' ? 'Editar sitio' : 'Nuevo sitio'}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">
              {mode === 'edit' && current ? current.nombre : 'Información del sitio'}
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Completa los datos básicos, ubicación y categoría.
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

        {/* Contenido SCROLLABLE */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Nombre</Label>
              <Input
                value={fNombre}
                onChange={(e) => setFNombre(e.target.value)}
                placeholder="Ej. Ruta Local • Relax"
              />
            </div>

            <div>
              <Label>Imagen (URL)</Label>
              <Input
                value={fImg}
                onChange={(e) => setFImg(e.target.value)}
                placeholder="https://…"
              />
              {fImg && (
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-600 dark:text-slate-300">
                  <span className="relative block h-12 w-12 overflow-hidden rounded-lg border border-slate-200/70 dark:border-white/10">
                    <Image src={fImg} alt="preview" fill sizes="48px" className="object-cover" />
                  </span>
                  <span>Vista previa</span>
                </div>
              )}
            </div>

            <div>
              <Label>Teléfono</Label>
              <Input
                value={fTelefono}
                onChange={(e) => setFTelefono(e.target.value)}
                placeholder="Ej. 8711234567"
              />
            </div>

            <div>
              <Label>Categoría</Label>
              <select
                value={fCatId === '' ? '' : String(fCatId)}
                onChange={(e) => setFCatId(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500
                           bg-slate-50 text-slate-900
                           dark:bg-slate-800/80 dark:text-slate-50 dark:border-slate-600 dark:[color-scheme:dark]"
              >
                <option value="">Selecciona una categoría</option>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Estado</Label>
              <Input
                value={fEstado}
                onChange={(e) => setFEstado(e.target.value)}
                placeholder="Ej. Nuevo León"
              />
            </div>

            <div>
              <Label>Municipio</Label>
              <Input
                value={fMunicipio}
                onChange={(e) => setFMunicipio(e.target.value)}
                placeholder="Ej. Gómez Palacio"
              />
            </div>

            <div>
              <Label>CP</Label>
              <Input
                value={fCP}
                onChange={(e) => setFCP(e.target.value)}
                placeholder="Ej. 34250"
              />
            </div>

            <div>
              <Label>Fraccionamiento</Label>
              <Input
                value={fFrac}
                onChange={(e) => setFFrac(e.target.value)}
                placeholder="Ej. Centro"
              />
            </div>

            <div className="sm:col-span-2">
              <Label>Calle</Label>
              <Input
                value={fCalle}
                onChange={(e) => setFCalle(e.target.value)}
                placeholder="Ej. Ferrería #715"
              />
            </div>

            <div>
              <Label>Latitud</Label>
              <Input
                value={fLat}
                onChange={(e) => setFLat(e.target.value)}
                placeholder="Ej. 25.690358"
              />
            </div>

            <div>
              <Label>Longitud</Label>
              <Input
                value={fLng}
                onChange={(e) => setFLng(e.target.value)}
                placeholder="Ej. -100.357723"
              />
            </div>
          </div>

          {err && (
            <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
              {err}
            </div>
          )}
        </div>

        {/* Footer fijo al final del card */}
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

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-slate-300">{children}</label>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 ${
        props.className ?? ''
      }`}
    />
  );
}

function fmtCoord(v: number | string, digits = 4) {
  const n = typeof v === 'number' ? v : parseFloat(v);
  return Number.isFinite(n) ? n.toFixed(digits) : '—';
}

function ActionButton({
  onClick,
  children,
  variant = 'ghost',
}: {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'ghost' | 'danger' | 'primary';
}) {
  const stylesMap: Record<'primary' | 'danger' | 'ghost', string> = {
    primary: 'bg-sky-600 text-white hover:bg-sky-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost:
      'border hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border-slate-200/70 dark:border-white/10',
  };

  return (
    <button onClick={onClick} className={`rounded-xl px-3 py-1.5 text-xs font-medium ${stylesMap[variant]}`}>
      {children}
    </button>
  );
}

function SitioRow({
  s,
  onEdit,
  onDelete,
}: {
  s: Sitio;
  onEdit: (s: Sitio) => void;
  onDelete: (s: Sitio) => void;
}) {
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
      <Td className="text-right">
        <div className="flex items-center justify-end gap-2">
          <ActionButton onClick={() => onEdit(s)} variant="ghost">
            Editar
          </ActionButton>
          <ActionButton onClick={() => onDelete(s)} variant="danger">
            Eliminar
          </ActionButton>
        </div>
      </Td>
    </tr>
  );
}
