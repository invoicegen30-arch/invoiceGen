import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl font-bold text-slate-300 mb-4">404</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Page not found</h2>
        <p className="text-slate-600 mb-6">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 text-sm font-medium transition-colors"
          >
            Go home
          </Link>
          <Link
            href="/help/faq"
            className="rounded-xl border border-black/10 bg-white hover:bg-slate-50 text-slate-900 px-6 py-2.5 text-sm font-medium transition-colors"
          >
            Help centre
          </Link>
        </div>
      </div>
    </div>
  );
}

