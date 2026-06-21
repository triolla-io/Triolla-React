import Script from 'next/script'
import { toGtagConsent, GTM_ID } from '@/lib/consent'

/**
 * Google Consent Mode v2 + GTM bootstrap. Rendered as static markup so script
 * order is guaranteed and pages stay statically prerenderable:
 *
 *   1. Initialize the consent DEFAULT to denied — this MUST run before GTM.
 *   2. Load the same GTM container the live WordPress site uses.
 *
 * Returning visitors who already consented are upgraded to "granted" on the
 * client (see ConsentProvider) within GTM's `wait_for_update` window — the
 * standard Consent Mode pattern. `@next/third-parties` is intentionally not
 * used: it injects GTM after hydration, too late to guarantee deny-by-default.
 */
export default function ConsentScripts() {
  const defaults = toGtagConsent(null)

  const consentDefault = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent','default',${JSON.stringify({ ...defaults, wait_for_update: 500 })});
gtag('set','ads_data_redaction', true);
gtag('set','url_passthrough', true);`.trim()

  const gtmLoader = `
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`.trim()

  return (
    <>
      {/* 1. Consent defaults — runs before any tag fires. `beforeInteractive`
          keeps these in the server HTML and guarantees execution order, so the
          deny-by-default consent state is set before GTM loads. The lint rule
          below predates the App Router (it points at pages/_document.js); the
          root layout is the documented home for beforeInteractive in App Router. */}
      {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
      <Script id="consent-default" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: consentDefault }} />
      {/* 2. Google Tag Manager */}
      {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
      <Script id="gtm-loader" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: gtmLoader }} />
      {/* GTM fallback for no-JS clients */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
          title="Google Tag Manager"
          sandbox=""
        />
      </noscript>
    </>
  )
}
