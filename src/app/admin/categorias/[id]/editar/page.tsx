'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BASE_URL } from '@/lib/api';

type Categoria = {
  id: number;
  nombre: string;
  img: string | null;
  color: string | null;
  reservable: boolean;
};

type UpdateBody = Partial<{
  nombre: string;
  img: string;
  color: string;
  reservable: boolean;
}>;

export default function EditarCategoriaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // form state
  const [nombre, setNombre] = useState('');
  const [img, setImg] = useState('');
  const [color, setColor] = useState('');
  const [reservable, setReservable] = useState(false);

  // validators
  const isValidHex = (v: string) => !v || /^#([0-9A-Fa-f]{6})$/.test(v);
  const isValidUrl = (v: string) => { if (!v) return true; try { new URL(v); return true; } catch { return false; } };

  // load current category
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`${BASE_URL}/categorias/${id}`, { cache: 'no-store' });
        const json = await r.json().catch(() => null);
        if (!r.ok) throw new Error((json && (json.message || json.error)) || `HTTP ${r.status}`);
        const c = json as Categoria;
        if (!alive) return;
        setNombre(c.nombre ?? '');
        setImg(c.img ?? '');
        setColor(c.color ?? '');
        setReservable(!!c.reservable);
      } catch (e: unknown) {
  const msg =
    e instanceof Error
      ? e.message
      : typeof e === 'string'
      ? e
      : 'No se pudo cargar la categoría';   // o el fallback correspondiente
  setErr(msg);
} finally {
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  const canSubmit = useMemo(() => {
    if (!nombre.trim()) return false;
    if (!isValidHex(color)) return false;
    if (!isValidUrl(img)) return false;
    return true;
  }, [nombre, color, img]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    setErr(null);

    const body: UpdateBody = {
      nombre: nombre.trim(),
      img: img.trim() || undefined,
      color: color.trim() || undefined,
      reservable,
    };

    try {
      const r = await fetch(`${BASE_URL}/categorias/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await r.json().catch(() => null);
      if (!r.ok) throw new Error((json && (json.message || json.error)) || `HTTP ${r.status}`);

      router.push('/admin/categorias?updated=1');
    } catch (e: unknown) {
  const msg =
    e instanceof Error
      ? e.message
      : typeof e === 'string'
      ? e
      : 'No se pudo actualizar la categoría';
  setErr(msg);
} finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen p-10">
        <div className="mx-auto max-w-3xl animate-pulse space-y-4">
          <div className="h-8 w-56 rounded bg-white/10" />
          <div className="h-40 rounded bg-white/10" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Editar categoría #{id}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Actualiza los campos y guarda.</p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.2)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
        >
          <div className="grid grid-cols-1 gap-5">
            {/* Nombre */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-slate-300">
                Nombre *
              </label>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
              />
              {!nombre.trim() && <p className="mt-1 text-xs text-red-600">El nombre es obligatorio</p>}
            </div>

            {/* Imagen (URL) */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-slate-300">
                Imagen (URL)
              </label>
              <input
                value={img}
                onChange={(e) => setImg(e.target.value)}
                placeholder="https://…"
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
              />
              {img && !isValidUrl(img) && (
                <p className="mt-1 text-xs text-red-600">Debe ser una URL válida</p>
              )}
              {img && isValidUrl(img) && (
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-600 dark:text-slate-300">
                  <span className="relative block h-12 w-12 overflow-hidden rounded border dark:border-white/10">
                    <Image src={img} alt="preview" fill sizes="48px" className="object-cover" />
                  </span>
                  Vista previa
                </div>
              )}
            </div>

            {/* Color */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-slate-300">
                Color (#RRGGBB)
              </label>
              <input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#27AE60"
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
              />
              {color && !isValidHex(color) && (
                <p className="mt-1 text-xs text-red-600">Formato esperado: #RRGGBB</p>
              )}
              {color && isValidHex(color) && (
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-600 dark:text-slate-300">
                  <span className="h-4 w-4 rounded border border-black/10 dark:border-white/30" style={{ backgroundColor: color }} />
                  Vista previa
                </div>
              )}
            </div>

            {/* Reservable */}
            <div className="flex items-center gap-2">
              <input
                id="reservable"
                type="checkbox"
                checked={reservable}
                onChange={(e) => setReservable(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <label htmlFor="reservable" className="text-sm text-slate-700 dark:text-slate-200">
                Reservable
              </label>
            </div>
          </div>

          {err && (
            <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
              {err}
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100 dark:border-white/10 dark:hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!canSubmit || saving}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
            >
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
