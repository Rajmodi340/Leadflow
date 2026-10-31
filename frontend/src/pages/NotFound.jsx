import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <section className="glass-card w-full max-w-lg p-8 sm:p-12 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-400">
          LeadFlow
        </p>
        <h1 className="mt-6 text-7xl font-bold tracking-tight text-slate-100">404</h1>
        <h2 className="mt-3 text-xl font-semibold text-slate-200">Page not found</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          The page you’re looking for may have been moved or doesn’t exist.
        </p>
        <Link to="/" className="btn-primary mt-8 justify-center">
          Back to home
        </Link>
      </section>
    </main>
  )
}
