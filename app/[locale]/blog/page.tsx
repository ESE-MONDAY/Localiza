import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isSupportedLocale, SupportedLocale } from '@/lib/types';
import { cms } from '@/lib/cms';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function BlogIndexPage({ params }: Props) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const posts = await cms.getAllPosts(locale as SupportedLocale);

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8 font-sans">
      <header className="border-b border-slate-800 pb-6 flex justify-between items-center">
        <div>
          <span className="px-2.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-mono font-bold">
            CMS BLOG HUB
          </span>
          <h1 className="text-3xl font-black mt-2">Architecture & Engineering</h1>
        </div>
        <Link
          href={`/${locale}/marketing`}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          ← Marketing
        </Link>
      </header>

      <div className="grid gap-6">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors space-y-3"
          >
            <div className="flex gap-2 items-center text-xs font-mono text-slate-400">
              <span className="text-sky-400">{post.author}</span>
              <span>•</span>
              <span>{post.publishedAt}</span>
            </div>
            <h2 className="text-xl font-bold">
              <Link
                href={`/${locale}/blog/${post.slug}`}
                className="hover:text-sky-400 transition-colors"
              >
                {post.title}
              </Link>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">{post.summary}</p>
            <div>
              <Link
                href={`/${locale}/blog/${post.slug}`}
                className="text-xs font-mono font-semibold text-sky-400 hover:underline"
              >
                Read Article →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}