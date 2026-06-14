import { test, expect } from '@playwright/test'

const PORTFOLIO_SLUG = 'dashboard-design'

const ROUTES = ['/', '/services', '/about-us', '/technology', '/contact-us', '/privacy-policy', '/terms-of-use', `/${PORTFOLIO_SLUG}`]

for (const route of ROUTES) {
  const name = route === '/' ? 'home' : route.replace(/\//g, '_').replace(/^_/, '')
  test(`full-page screenshot ${name} (${route})`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'networkidle' })
    // Settle lazy/in-view content and webfont swap before snapshotting.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(800)
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(400)
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true })
  })
}
