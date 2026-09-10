import Link from 'next/link';

export default function Custom404() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center font-sans space-y-4">
      <h1 className="text-4xl font-bold font-mono">404</h1>
      <p className="text-slate-400 text-sm">This page could not be found.</p>
      <Link
        href="/en/marketing"
        className="text-xs font-mono text-sky-400 hover:underline"
      >
        ← Return to Marketing
      </Link>
    </div>
  );
}