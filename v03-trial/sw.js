'use strict';
const PREFIX='yamato-kokushi-v03-trial-'+encodeURIComponent(new URL(self.registration.scope).pathname)+'-';
const CACHE=PREFIX+'apple-ledger-'+'2c15ad3178';
const FILES=['./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const req=event.request;if(req.method!=='GET')return;
 const u=new URL(req.url),scope=new URL(self.registration.scope);
 if(u.origin!==scope.origin||!u.pathname.startsWith(scope.pathname))return;
 const relative=u.pathname.slice(scope.pathname.length);
 const isIndex=relative===''||relative==='index.html';
 if(!isIndex&&!['manifest.webmanifest','icon-192.png','icon-512.png'].includes(relative))return;
 const key=isIndex?new URL('index.html',scope).href:req.url;
 event.respondWith(caches.open(CACHE).then(cache=>cache.match(key)).then(hit=>hit||fetch(req)));
});
