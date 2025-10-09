export default function Loading() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8 h-7 w-60 rounded-lg bg-white/10 animate-pulse" />
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="h-8 w-full rounded bg-white/10 animate-pulse" />
          <div className="mt-4 h-8 w-2/3 rounded bg-white/10 animate-pulse" />
          <div className="mt-6 h-10 w-32 rounded bg-white/10 animate-pulse" />
        </div>
      </div>
    </main>
  );
}
