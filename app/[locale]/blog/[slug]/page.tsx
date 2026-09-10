import { notFound } from 'next/navigation';
import Link from 'next/link';
import { isSupportedLocale, SupportedLocale, SUPPORTED_LOCALES } from '@/lib/types';
import { cms } from '@/lib/cms';

type Props = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const slugs = await cms.getAllSlugs();
  const params: { locale: string; slug: string }[] = [];

  for (const locale of SUPPORTED_LOCALES) {
    for (const slug of slugs) {
      params.push({ locale, slug });
    }
  }
  return params;
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const post = await cms.getPost(slug, locale as SupportedLocale);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 sm:p-12">
      <div className="max-w-3xl mx-auto space-y-10">
        
        {/* Breadcrumbs & Locale Switcher */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-400">
            <Link href={`/${locale}/blog`} className="hover:text-white transition-colors">
              Blog
            </Link>
            <span>/</span>
            <span className="text-sky-400 truncate max-w-[200px]">{post.slug}</span>
          </div>

          <div className="flex gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1">
            {SUPPORTED_LOCALES.map((l) => (
              <Link
                key={l}
                href={`/${l}/blog/${slug}`}
                className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition-colors ${
                  l === locale
                    ? 'bg-sky-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {l}
              </Link>
            ))}
          </div>
        </div>

        {/* Post Heading */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-mono">
            CMS TAG: cms-posts
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-400 pt-2">
            <span>By {post.author}</span>
            <span>•</span>
            <span>Published {post.publishedAt}</span>
          </div>
        </header>

        {/* Post Body */}
        <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-6 text-slate-300 leading-relaxed text-base">
          <p className="text-lg text-slate-200 font-medium border-b border-slate-800/80 pb-4 leading-relaxed">
            {post.summary}
          </p>
          <div className="space-y-4">
            <p>{post.body}</p>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800">
          <Link
            href={`/${locale}/blog`}
            className="text-xs font-mono text-slate-400 hover:text-white transition-colors"
          >
            ← Back to Blog Hub
          </Link>
          <Link
            href={`/${locale}/pricing`}
            className="text-xs font-mono font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 px-4 py-2 rounded-lg transition-colors"
          >
            View Zero-CLS Pricing Matrix →
          </Link>
        </div>

      </div>
    </div>
  );
}