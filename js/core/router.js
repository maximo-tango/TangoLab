export function router(routes){const go=()=>{const p=(location.hash.replace(/^#/,'')||'/').split('?')[0];(routes[p]||routes['/'])();scrollTo(0,0)};addEventListener('hashchange',go);go()}
