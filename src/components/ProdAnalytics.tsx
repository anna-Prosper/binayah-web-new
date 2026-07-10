"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const GA_ID = "G-9FZKWX04K3";
const GTM_ID = "GTM-PG6Z43HD";
const CLARITY_ID = "wuee1w39pj";
const LIVECHAT_LICENSE = "6313921";

// Only real production hosts get analytics. This gate used to run server-side
// from the request host, which forced the root layout to read headers() and
// made every page render dynamically (no ISR/edge cache). Checking
// location.hostname on the client instead keeps the page HTML static and
// cacheable; the scripts inject right after hydration.
const PROD_HOSTS = new Set(["www.binayah.ae", "binayah.ae", "binayah.ru", "www.binayah.ru"]);

export default function ProdAnalytics({ nonce }: { nonce: string }) {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined" && PROD_HOSTS.has(window.location.hostname)) {
      setEnabled(true);
    }
  }, []);

  if (!enabled) return null;

  return (
    <>
      {/* Google Tag Manager */}
      <Script id="gtm-init" strategy="afterInteractive" nonce={nonce}>
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="lazyOnload" nonce={nonce} />
      <Script id="ga-init" strategy="lazyOnload" nonce={nonce}>
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>
      <Script id="clarity-init" strategy="lazyOnload" nonce={nonce}>
        {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "${CLARITY_ID}");`}
      </Script>
      <Script id="livechat-init" strategy="lazyOnload" nonce={nonce}>
        {`window.__lc = window.__lc || {};
window.__lc.license = ${LIVECHAT_LICENSE};
window.__lc.integration_name = "manual_channels";
window.__lc.product_name = "livechat";
window.__lc.asyncInit = true;
(function(n,t,c){function i(n){return e._h?e._h.apply(null,n):e._q.push(n)}var e={_q:[],_h:null,_v:"2.0",on:function(){i(["on",c.call(arguments)])},once:function(){i(["once",c.call(arguments)])},off:function(){i(["off",c.call(arguments)])},get:function(){if(!e._h)throw new Error("[LiveChatWidget] You can't use getters before load.");return i(["get",c.call(arguments)])},call:function(){i(["call",c.call(arguments)])},init:function(){var n=t.createElement("script");n.async=!0,n.type="text/javascript",n.src="https://cdn.livechatinc.com/tracking.js",t.head.appendChild(n)}};!n.__lc.asyncInit&&e.init(),n.LiveChatWidget=n.LiveChatWidget||e})(window,document,[].slice);
(function(){var s=false;function go(){if(s)return;s=true;var w=window.LiveChatWidget;if(w&&w.init){w.init();}}['pointerdown','keydown','touchstart','scroll'].forEach(function(ev){window.addEventListener(ev,go,{once:true,passive:true});});setTimeout(go,5000);})();`}
      </Script>
    </>
  );
}
