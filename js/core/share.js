// 학생 공유 링크: 로그인·서버 없이 링크 자체에 읽기 전용 데이터를 담는다 (deflate 압축 + base64url)
const toB64=u=>{let s='';for(let i=0;i<u.length;i+=8192)s+=String.fromCharCode(...u.subarray(i,i+8192));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
const fromB64=t=>Uint8Array.from(atob(t.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
const pipe=async(bytes,stream)=>new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());
export async function encode(obj){
  const raw=new TextEncoder().encode(JSON.stringify(obj));
  if(typeof CompressionStream==='function')try{return 'z'+toB64(await pipe(raw,new CompressionStream('deflate-raw')))}catch{}
  return 'p'+toB64(raw);
}
export async function decode(s){
  if(!s)throw new Error('empty');
  const b=fromB64(s.slice(1));
  const raw=s[0]==='z'?await pipe(b,new DecompressionStream('deflate-raw')):b;
  return JSON.parse(new TextDecoder().decode(raw));
}
export const linkFor=payload=>encode(payload).then(d=>`${location.origin}${location.pathname}#/my?d=${d}`);
export async function copy(text){
  try{await navigator.clipboard.writeText(text);return true}catch{}
  try{const t=document.createElement('textarea');t.value=text;t.style.cssText='position:fixed;opacity:0';document.body.appendChild(t);t.select();const ok=document.execCommand('copy');t.remove();return ok}catch{return false}
}
