"use strict";(()=>{var e={};e.id=164,e.ids=[164,888,660],e.modules={1323:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,r){return r in t?t[r]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,r)):"function"==typeof t&&"default"===r?t:void 0}}})},9287:(e,t,r)=>{r.a(e,async(e,o)=>{try{r.r(t),r.d(t,{config:()=>h,default:()=>u,getServerSideProps:()=>d,getStaticPaths:()=>m,getStaticProps:()=>g,reportWebVitals:()=>f,routeModule:()=>b,unstable_getServerProps:()=>S,unstable_getServerSideProps:()=>j,unstable_getStaticParams:()=>y,unstable_getStaticPaths:()=>P,unstable_getStaticProps:()=>x});var a=r(7093),i=r(5244),s=r(1323),n=r(118),l=r(5201),c=r(6436),p=e([l]);l=(p.then?(await p)():p)[0];let u=(0,s.l)(c,"default"),g=(0,s.l)(c,"getStaticProps"),m=(0,s.l)(c,"getStaticPaths"),d=(0,s.l)(c,"getServerSideProps"),h=(0,s.l)(c,"config"),f=(0,s.l)(c,"reportWebVitals"),x=(0,s.l)(c,"unstable_getStaticProps"),P=(0,s.l)(c,"unstable_getStaticPaths"),y=(0,s.l)(c,"unstable_getStaticParams"),S=(0,s.l)(c,"unstable_getServerProps"),j=(0,s.l)(c,"unstable_getServerSideProps"),b=new a.PagesRouteModule({definition:{kind:i.x.PAGES,page:"/sitemap.xml",pathname:"/sitemap.xml",bundlePath:"",filename:""},components:{App:l.default,Document:n.default},userland:c});o()}catch(e){o(e)}})},118:(e,t,r)=>{r.r(t),r.d(t,{default:()=>i});var o=r(997),a=r(6859);function i(){return(0,o.jsxs)(a.Html,{lang:"en",children:[(0,o.jsxs)(a.Head,{children:[o.jsx("meta",{charSet:"utf-8"}),o.jsx("link",{rel:"icon",href:"/favicon.ico",sizes:"any"}),o.jsx("link",{rel:"icon",type:"image/png",sizes:"32x32",href:"/images/logo.png"}),o.jsx("link",{rel:"apple-touch-icon",href:"/images/logo.png"}),o.jsx("meta",{name:"theme-color",content:"#8B2942"}),o.jsx("meta",{name:"msapplication-TileColor",content:"#8B2942"}),o.jsx("link",{rel:"preconnect",href:"https://fonts.googleapis.com"}),o.jsx("link",{rel:"preconnect",href:"https://fonts.gstatic.com",crossOrigin:"anonymous"}),o.jsx("link",{rel:"preconnect",href:"https://server.zzuhana.com"})]}),(0,o.jsxs)("body",{children:[o.jsx(a.Main,{}),o.jsx(a.NextScript,{})]})]})}},6436:(e,t,r)=>{r.r(t),r.d(t,{default:()=>i,getServerSideProps:()=>s});let o="https://zzuhana.com",a="https://server.zzuhana.com/api/v1";function i(){}async function s({res:e}){var t,r;let i=[],s=[];try{let[e,t]=await Promise.all([fetch(`${a}/products/?page_size=1000`),fetch(`${a}/products/categories/`)]);if(e.ok){let t=await e.json();i=t.results||t||[]}t.ok&&(s=await t.json())}catch(e){}let n=(t=i,r=s,`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static Pages -->
  <url>
    <loc>${o}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${o}/products</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${o}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${o}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- Category Pages -->
  ${r.map(e=>`
  <url>
    <loc>${o}/category/${e.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>${e.subcategories?.map(t=>`
  <url>
    <loc>${o}/category/${e.slug}/${t.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join("")||""}`).join("")}

  <!-- Product Pages -->
  ${t.map(e=>`
  <url>
    <loc>${o}/product/${e.slug}</loc>
    <lastmod>${e.updated_at?new Date(e.updated_at).toISOString().split("T")[0]:new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join("")}
</urlset>`);return e.setHeader("Content-Type","text/xml"),e.setHeader("Cache-Control","public, s-maxage=86400, stale-while-revalidate"),e.write(n),e.end(),{props:{}}}},5244:(e,t)=>{var r;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return r}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(r||(r={}))},2785:e=>{e.exports=require("next/dist/compiled/next-server/pages.runtime.prod.js")},6689:e=>{e.exports=require("react")},6405:e=>{e.exports=require("react-dom")},997:e=>{e.exports=require("react/jsx-runtime")},3258:e=>{e.exports=import("@reduxjs/toolkit")},9648:e=>{e.exports=import("axios")},6197:e=>{e.exports=import("framer-motion")},6201:e=>{e.exports=import("react-hot-toast")},3291:e=>{e.exports=import("react-redux")},7147:e=>{e.exports=require("fs")},1017:e=>{e.exports=require("path")},2781:e=>{e.exports=require("stream")},9796:e=>{e.exports=require("zlib")}};var t=require("../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),o=t.X(0,[491,163,859,201],()=>r(9287));module.exports=o})();