import { defineConfig } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },
  {
    // All images are served from an external WordPress CMS.
    // next/image requires remotePatterns config for each domain, and
    // the CMS content is fully dynamic, so native <img> is correct here.
    rules: {
      '@next/next/no-img-element': 'off',
    },
  },
])

export default eslintConfig
