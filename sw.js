const V='inv-v1';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  const u=new URL(r.url);
  // الصفحة نفسها: الشبكة أولًا (علشان التحديثات) وبعدها النسخة المحفوظة
  if(u.origin===location.origin){
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put(r,cp));return res;}).catch(()=>caches.match(r).then(m=>m||(r.mode==='navigate'?caches.match('./index.html'):Response.error()))));
    return;
  }
  // خطوط/مكتبات خارجية: من الكاش لو موجودة، وإلا من النت وتتخزن
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{const cp=res.clone();caches.open(V).then(c=>c.put(r,cp));return res;}).catch(()=>m)));
});
