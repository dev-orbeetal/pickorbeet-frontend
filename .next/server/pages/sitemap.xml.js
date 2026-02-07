"use strict";(()=>{var e={};e.id=164,e.ids=[164,888,660],e.modules={1323:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,r){return r in t?t[r]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,r)):"function"==typeof t&&"default"===r?t:void 0}}})},9287:(e,t,r)=>{r.a(e,async(e,a)=>{try{r.r(t),r.d(t,{config:()=>d,default:()=>u,getServerSideProps:()=>h,getStaticPaths:()=>g,getStaticProps:()=>m,reportWebVitals:()=>x,routeModule:()=>v,unstable_getServerProps:()=>P,unstable_getServerSideProps:()=>S,unstable_getStaticParams:()=>j,unstable_getStaticPaths:()=>f,unstable_getStaticProps:()=>y});var o=r(7093),i=r(5244),n=r(1323),s=r(118),l=r(5201),p=r(6436),c=e([l]);l=(c.then?(await c)():c)[0];let u=(0,n.l)(p,"default"),m=(0,n.l)(p,"getStaticProps"),g=(0,n.l)(p,"getStaticPaths"),h=(0,n.l)(p,"getServerSideProps"),d=(0,n.l)(p,"config"),x=(0,n.l)(p,"reportWebVitals"),y=(0,n.l)(p,"unstable_getStaticProps"),f=(0,n.l)(p,"unstable_getStaticPaths"),j=(0,n.l)(p,"unstable_getStaticParams"),P=(0,n.l)(p,"unstable_getServerProps"),S=(0,n.l)(p,"unstable_getServerSideProps"),v=new o.PagesRouteModule({definition:{kind:i.x.PAGES,page:"/sitemap.xml",pathname:"/sitemap.xml",bundlePath:"",filename:""},components:{App:l.default,Document:s.default},userland:p});a()}catch(e){a(e)}})},118:(e,t,r)=>{r.r(t),r.d(t,{default:()=>i});var a=r(997),o=r(6859);function i(){return(0,a.jsxs)(o.Html,{lang:"en",children:[(0,a.jsxs)(o.Head,{children:[a.jsx("meta",{charSet:"utf-8"}),a.jsx("link",{rel:"icon",href:"/favicon.ico",sizes:"any"}),a.jsx("link",{rel:"icon",type:"image/png",sizes:"32x32",href:"/images/logo.png"}),a.jsx("link",{rel:"apple-touch-icon",href:"/images/logo.png"}),a.jsx("meta",{name:"theme-color",content:"#8B2942"}),a.jsx("meta",{name:"msapplication-TileColor",content:"#8B2942"}),a.jsx("meta",{property:"og:type",content:"website"}),a.jsx("meta",{property:"og:site_name",content:"Zzuhana"}),a.jsx("meta",{property:"og:image",content:"https://zzuhana-client-rdeavl8og-rahikifs-projects.vercel.app/images/logo.png"}),a.jsx("meta",{property:"og:image:secure_url",content:"https://zzuhana-client-rdeavl8og-rahikifs-projects.vercel.app/images/logo.png"}),a.jsx("meta",{property:"og:image:type",content:"image/png"}),a.jsx("meta",{property:"og:image:width",content:"1200"}),a.jsx("meta",{property:"og:image:height",content:"630"}),a.jsx("meta",{property:"og:image:alt",content:"Zzuhana - Premium Clothing Store"}),a.jsx("meta",{property:"og:url",content:"https://zzuhana.com"}),a.jsx("meta",{property:"og:title",content:"Zzuhana - Premium Clothing Store"}),a.jsx("meta",{property:"og:description",content:"Shop premium quality Borkha, Hijab, Abaya, Niqab and modest fashion at Zzuhana. Discover the latest trends with exceptional quality and fast delivery in Bangladesh."}),a.jsx("meta",{name:"twitter:card",content:"summary_large_image"}),a.jsx("meta",{name:"twitter:image",content:"https://zzuhana-client-rdeavl8og-rahikifs-projects.vercel.app/images/logo.png"}),a.jsx("meta",{name:"twitter:title",content:"Zzuhana - Premium Clothing Store"}),a.jsx("meta",{name:"twitter:description",content:"Shop premium quality Borkha, Hijab, Abaya, Niqab and modest fashion at Zzuhana. Discover the latest trends with exceptional quality and fast delivery in Bangladesh."}),a.jsx("meta",{property:"og:locale",content:"en_US"}),a.jsx("meta",{name:"description",content:"Shop premium quality Borkha, Hijab, Abaya, Niqab and modest fashion at Zzuhana. Discover the latest trends with exceptional quality and fast delivery in Bangladesh."}),a.jsx("link",{rel:"preconnect",href:"https://fonts.googleapis.com"}),a.jsx("link",{rel:"preconnect",href:"https://fonts.gstatic.com",crossOrigin:"anonymous"}),a.jsx("link",{rel:"preconnect",href:"https://server.zzuhana.com"})]}),(0,a.jsxs)("body",{children:[a.jsx(o.Main,{}),a.jsx(o.NextScript,{})]})]})}},6436:(e,t,r)=>{r.r(t),r.d(t,{default:()=>i,getServerSideProps:()=>n});let a="https://www.zzuhana.com",o="https://server.zzuhana.com/api/v1";function i(){}async function n({res:e}){var t,r;let i=[],n=[];try{let[e,t]=await Promise.all([fetch(`${o}/products/?page_size=1000`),fetch(`${o}/products/categories/`)]);if(e.ok){let t=await e.json();i=t.results||t||[]}t.ok&&(n=await t.json())}catch(e){}let s=(t=i,r=n,`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static Pages -->
  <url>
    <loc>${a}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${a}/products</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${a}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${a}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- Category Pages -->
  ${r.map(e=>`
  <url>
    <loc>${a}/category/${e.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>${e.subcategories?.map(t=>`
  <url>
    <loc>${a}/category/${e.slug}/${t.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join("")||""}`).join("")}

  <!-- Product Pages -->
  ${t.map(e=>`
  <url>
    <loc>${a}/product/${e.slug}</loc>
    <lastmod>${e.updated_at?new Date(e.updated_at).toISOString().split("T")[0]:new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join("")}
</urlset>`);return e.setHeader("Content-Type","text/xml"),e.setHeader("Cache-Control","public, s-maxage=86400, stale-while-revalidate"),e.write(s),e.end(),{props:{}}}},5244:(e,t)=>{var r;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return r}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(r||(r={}))},2785:e=>{e.exports=require("next/dist/compiled/next-server/pages.runtime.prod.js")},6689:e=>{e.exports=require("react")},6405:e=>{e.exports=require("react-dom")},997:e=>{e.exports=require("react/jsx-runtime")},3258:e=>{e.exports=import("@reduxjs/toolkit")},9648:e=>{e.exports=import("axios")},6197:e=>{e.exports=import("framer-motion")},6201:e=>{e.exports=import("react-hot-toast")},3291:e=>{e.exports=import("react-redux")},7147:e=>{e.exports=require("fs")},1017:e=>{e.exports=require("path")},2781:e=>{e.exports=require("stream")},9796:e=>{e.exports=require("zlib")}};var t=require("../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),a=t.X(0,[491,163,859,201],()=>r(9287));module.exports=a})();