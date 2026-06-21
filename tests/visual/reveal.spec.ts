import { test, expect } from '@playwright/test'

// Reveal targets must be fully visible (opacity 1) under reduced motion,
// since no html.gsap class is added and no animation runs.
test('reveal content is visible under reduced motion on services', async ({ page }) => {
  await page.goto('/services', { waitUntil: 'networkidle' })
  const html = page.locator('html')
  await expect(html).not.toHaveClass(/(^|\s)gsap(\s|$)/)
})
