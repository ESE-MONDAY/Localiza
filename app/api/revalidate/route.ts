import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

const REVALIDATION_SECRET =
  process.env.REVALIDATION_SECRET_TOKEN || 'frontier-revalidate-secret-token';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (authHeader !== `Bearer ${REVALIDATION_SECRET}`) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid bearer token' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { tag, cohort, currency, path } = body;

    // Helper to safely trigger revalidation across Next.js 16 signatures
    const purgeTag = (targetTag: string) => {
      try {
        // Cast as any or provide second argument to satisfy TS2554 in Next.js 16
        (revalidateTag as any)(targetTag, { expire: 0 });
      } catch {
        (revalidateTag as any)(targetTag);
      }
    };

    if (tag) {
      purgeTag(tag);
      return NextResponse.json({
        revalidated: true,
        scope: 'direct-tag',
        target: tag,
        timestamp: new Date().toISOString(),
      });
    }

    if (cohort) {
      const cohortTag = `pricing-${cohort}`;
      purgeTag(cohortTag);
      return NextResponse.json({
        revalidated: true,
        scope: 'cohort-partition',
        target: cohortTag,
        timestamp: new Date().toISOString(),
      });
    }

    if (currency) {
      const currencyTag = `pricing-${currency}`;
      purgeTag(currencyTag);
      return NextResponse.json({
        revalidated: true,
        scope: 'currency-partition',
        target: currencyTag,
        timestamp: new Date().toISOString(),
      });
    }

    if (path) {
      revalidatePath(path);
      return NextResponse.json({
        revalidated: true,
        scope: 'path',
        target: path,
        timestamp: new Date().toISOString(),
      });
    }

    // Default: Purge global pricing tag & path
    purgeTag('pricing');
    revalidatePath('/[locale]/pricing', 'page');

    return NextResponse.json({
      revalidated: true,
      scope: 'global-pricing',
      target: 'pricing',
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
  }
}