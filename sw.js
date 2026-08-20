const C="finance-nexora-v1-12";
const A=["./","./index.html","./styles.css","./app.js?v=1.12.0","./manifest.webmanifest","./icons/icon-192.png","./icons/icon-512.png"];
self.addEventListener("install",e=>e.waitUntil(caches.open(C).then(c=>c.addAll(A)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const url=new URL(e.request.url);
  const same=url.origin===self.location.origin;
  const navigation=e.request.mode==="navigate";
  const appAsset=same && /\.(js|css|html)$/.test(url.pathname);
  if(navigation||appAsset){
    e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(C).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html"))));
  }else if(same){
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{const copy=resp.clone();caches.open(C).then(c=>c.put(e.request,copy));return resp})));
  }
});
