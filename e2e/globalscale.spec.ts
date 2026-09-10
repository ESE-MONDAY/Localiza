import { test, expect } from '@playwright/test';

const LOCALES = ['en', 'es', 'de', 'fr'] as const;
const BLOG_SLUGS = [
  'zero-cls-edge-monetization',
  'micro-frontier-hybrid-routing',
] as const;

test.describe('GlobalScale v16 - Comprehensive Test Suite', () => {

  // ===========================================================================
  // 1. PAGES ROUTER: MARKETING PAGES (ALL LOCALES)
  // ===========================================================================
  test.describe('Marketing Pages (Pages Router SSG)', () => {
    for (const locale of LOCALES) {
      test(`should render static marketing page for locale: [${locale.toUpperCase()}]`, async ({ page }) => {
        await page.goto(`/${locale}/marketing`);

        // Check Pages Router badge
        await expect(page.getByText(/pages router/i)).toBeVisible();

        // Check active locale indicator is highlighted
        const activeChip = page.locator(`a[href="/${locale}/marketing"]`);
        await expect(activeChip).toHaveClass(/bg-purple-600/);

        // Ensure CTA to Dashboard is present
        const ctaLink = page.locator(`a[href="/${locale}/dashboard"]`);
        await expect(ctaLink).toBeVisible();
      });
    }

    test('should switch languages on marketing page without session loss', async ({ page }) => {
      await page.goto('/en/marketing');
     await expect(page.getByText(/pages router/i)).toBeVisible();

      // Click German switcher
      await page.click('a[href="/de/marketing"]');
      await page.waitForURL('**/de/marketing');
      await expect(page.locator('a[href="/de/marketing"]')).toHaveClass(/bg-purple-600/);
    });
  });

  // ===========================================================================
  // 2. CROSS-ROUTER BOUNDARY CROSSING (Pages -> App Router)
  // ===========================================================================
  test('should navigate across router boundary from Pages to App Router cleanly', async ({ page }) => {
    await page.goto('/en/marketing');
   await expect(page.getByText(/pages router/i)).toBeVisible();

    // Click bridge CTA targeting dashboard
    const ctaLink = page.locator('a[href$="/dashboard"]');
    await expect(ctaLink).toBeVisible();
    await ctaLink.click();

    // Verify App Router dashboard loads
    await page.waitForURL('**/en/dashboard');
    await expect(page.locator('text=APP ROUTER (RSC)')).toBeVisible();
    await expect(page.locator('text=Active Edge Identity')).toBeVisible();

    // Verify backward link returns cleanly to Pages Router
    const backLink = page.locator('a[href$="/marketing"]');
    await expect(backLink).toBeVisible();
    await backLink.click();
    await page.waitForURL('**/en/marketing');
   await expect(page.getByText(/pages router/i)).toBeVisible();
  });

  // ===========================================================================
  // 3. APP ROUTER: ZERO-CLS PRICING MATRIX & REGIONAL CURRENCY
  // ===========================================================================
  test.describe('Pricing Paywall & Zero-CLS SLA', () => {
    test('should resolve German route to EUR (€) with zero layout shift', async ({ page }) => {
      await page.goto('/de/pricing');

      // Verify currency symbol in first paint
      const priceElement = page.locator('text=€').first();
      await expect(priceElement).toBeVisible();

      // Validate strict CLS score
      const clsScore = await page.evaluate(async () => {
        return new Promise<number>((resolve) => {
          let cls = 0;
          const observer = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                cls += (entry as any).value;
              }
            }
          });
          observer.observe({ type: 'layout-shift', buffered: true });
          setTimeout(() => {
            observer.disconnect();
            resolve(cls);
          }, 800);
        });
      });

      expect(clsScore).toBeLessThan(0.05);
    });

  // TEST 3.2: Cohort Simulation
    test('should support cohort simulation query parameters', async ({ page }) => {
      await page.goto('/en/pricing?cohort=annual_discount&country=GB');

      // Verify British Pound currency symbol resolution
      await expect(page.locator('text=£').first()).toBeVisible();

      // Check for 20% indicator or annual discount banner (flexible match)
      const discountBanner = page.locator('text=/20%|Discount|Annual/i').first();
      await expect(discountBanner).toBeVisible();
    });
  });

  // ===========================================================================
  // 4. APP ROUTER: DYNAMIC CMS BLOGS (ALL LOCALES & SLUGS)
  // ===========================================================================
  test.describe('Dynamic Localized CMS Blogs', () => {
    for (const slug of BLOG_SLUGS) {
      test(`should render blog [${slug}] across all 4 languages`, async ({ page }) => {
        for (const locale of LOCALES) {
          await page.goto(`/${locale}/blog/${slug}`);

          // Assert CMS tag badge is present
          await expect(page.locator('text=CMS TAG: cms-posts')).toBeVisible();

          // Assert article headline exists and has content
          const heading = page.locator('h1');
          await expect(heading).toBeVisible();
          const text = await heading.textContent();
          expect(text?.length).toBeGreaterThan(10);

          // Assert active locale indicator
          const activeLocaleChip = page.locator(`a[href="/${locale}/blog/${slug}"]`);
          await expect(activeLocaleChip).toHaveClass(/bg-sky-500/);
        }
      });
    }

    test('should navigate between blog posts via cross-links', async ({ page }) => {
      await page.goto('/en/blog/zero-cls-edge-monetization');

      // Check footer link to pricing
      const pricingLink = page.locator('a[href$="/pricing"]');
      await expect(pricingLink).toBeVisible();
      await pricingLink.click();

      await page.waitForURL('**/en/pricing');
      await expect(page.locator('text=ZERO-CLS PAYWALL GATE')).toBeVisible();
    });
  });

  // ===========================================================================
  // 5. TELEMETRY BUFFER INTEGRITY
  // ===========================================================================
 // ===========================================================================
  // 5. TELEMETRY BUFFER INTEGRITY
  // ===========================================================================
  test('should dispatch non-blocking beacon when selecting a pricing tier', async ({ page }) => {
    await page.goto('/en/pricing');

    // 1. Prepare intercept for telemetry route
    const telemetryPromise = page.waitForRequest((request) => {
      return request.url().includes('/api/telemetry') && request.method() === 'POST';
    });

    // 2. Select first interactive tier button by role rather than text-bound selector
    const tierCard = page.locator('div:has(button)').filter({ hasText: /USD|\$|EUR|€|GBP|£/ }).first();
    const actionButton = tierCard.locator('button').last();
    
    await expect(actionButton).toBeVisible();
    await actionButton.click();

    // 3. Verify optimistic change or state transition
    await expect(actionButton).toHaveText(/Enrolled|Selected|✓/i);

    // 4. Verify telemetry request payload
    const request = await telemetryPromise;
    const postData = JSON.parse(request.postData() || '{}');

    expect(Array.isArray(postData.events)).toBeTruthy();
    expect(postData.events.length).toBeGreaterThan(0);

    const tierEvent = postData.events.find((e: any) => e.eventType === 'tier_select');
    expect(tierEvent).toBeDefined();
    expect(tierEvent.userId).toContain('usr_');
  });
});