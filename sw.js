// 오프라인 지원: 온라인이면 항상 최신 파일을, 오프라인이면 마지막으로 받은 파일을 보여준다
const CACHE='tango-lab-v1';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin)return; // 구글 로그인/시트 요청은 건드리지 않음
  e.respondWith(fetch(r,{cache:'no-cache'}).then(res=>{
    if(res.ok){const c=res.clone();caches.open(CACHE).then(x=>x.put(r,c))}
    return res;
  }).catch(()=>caches.match(r).then(m=>m||(r.mode==='navigate'?caches.match('index.html'):Response.error()))));
});
