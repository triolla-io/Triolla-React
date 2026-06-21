import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/visual',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    // reducedMotion must go through contextOptions here — the bare `reducedMotion`
    // use-option isn't in this Playwright version's typed UseOptions and is
    // silently ignored at runtime.
    contextOptions: { reducedMotion: 'reduce' },
    // Reduced motion => no ScrollSmoother => normal document flow => fullPage
    // screenshots capture the whole page and stay stable across runs.
    // Freeze animations at frame 0 so live timing differences never flake the diff.
    // The static rendered frame is what we gate on.
  },
  expect: {
    // Allow sub-pixel AA noise but catch real layout/color shifts.
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.01,
      scale: 'css',
    },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
