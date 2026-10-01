// 화면 전환 시 이전 화면의 타이머·리스너를 정리하고, 새 화면용 #app 컨테이너를 만든다
let off=null;
export const onLeave=f=>{off=f};
export const leave=()=>{if(off){const f=off;off=null;try{f()}catch(e){}}};
export function mount(){leave();const o=document.querySelector('#app'),n=o.cloneNode(false);o.replaceWith(n);return n}
