import { test, expect } from '@playwright/test'

const PORTFOLIO_SLUG = 'dashboard-design'

const ROUTES = ['/', '/services', '/about-us', '/technology', '/contact-us', '/privacy-policy', '/terms-of-use', `/${PORTFOLIO_SLUG}`]

for (const route of ROUTES) {
  const name = route === '/' ? 'home' : route.replace(/\//g, '_').replace(/^_/, '')
  test(`full-page screenshot ${name} (${route})`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'networkidle' })
    // Guard against capturing a pre-content render (dev cold-compile can resolve
    // navigation before the page body has laid out): wait for the footer, which
    // every route renders at the bottom of the document.
    await page.locator('footer').first().waitFor({ state: 'visible', timeout: 30_000 })
    // Step down a viewport at a time so IntersectionObserver-driven reveals
    // (SectionReveal, whileInView) actually fire — an instant jump to the
    // bottom scrolls mid-page sections past the viewport before their observer
    // can trigger, leaving them stuck at opacity 0 in the snapshot.
    await page.evaluate(async () => {
      const step = window.innerHeight
      const max = document.body.scrollHeight
      for (let y = 0; y <= max; y += step) {
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 120))
      }
      window.scrollTo(0, 0)
    })
    // Settle the last reveal transition + webfont swap before snapshotting.
    await page.waitForTimeout(800)
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true })
  })
}
