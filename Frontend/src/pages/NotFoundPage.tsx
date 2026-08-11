import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center bg-brand-50 px-4 py-24 text-center">
      <div className="max-w-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">404</p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-emerald-950 sm:text-5xl">
          This page could not be found
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          The page may have moved, but there is plenty more to explore at We4Climate.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-600"
        >
          Return to the homepage
        </Link>
      </div>
    </section>
  );
}

