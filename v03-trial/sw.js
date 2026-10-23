'use strict';
// Network-first for app files; offline cache fallback. Does not modify study records.
const PREFIX='yamato-kokushi-v03-trial-'+encodeURIComponent(new URL(self.registration.scope).pathname)+'-';
const BUILD='wa-modern-weakness-20261023-4';
const CACHE=PREFIX+'final-'+BUILD;
const FILES=['./index.html','./quiz-core.js','./app.js','./preferences.js','./wamodern-ui.js','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const req=event.request;if(req.method!=='GET')return;
 const url=new URL(req.url),scope=new URL(self.registration.scope);
 if(url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
 const relative=url.pathname.slice(scope.pathname.length);
 if(relative!==''&&!FILES.includes('./'+relative))return;
 const key=relative===''||relative==='index.html'?new URL('index.html',scope).href:url.origin+url.pathname;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  try{const response=await fetch(new Request(key,{cache:'no-store',credentials:'same-origin'}));
   if(response.ok){await cache.put(key,response.clone());return response;}
   throw new Error('HTTP '+response.status);
  }catch(error){const saved=await cache.match(key);if(saved)return saved;throw error;}
 })());
});
self.addEventListener('message',event=>{
 if(event.data?.type!=='CACHE_STATUS')return;
 event.waitUntil(caches.open(CACHE).then(async cache=>{
  const hits=await Promise.all(FILES.map(file=>cache.match(file)));
  event.ports[0]?.postMessage({ready:hits.every(Boolean),build:BUILD});
 }));
});
