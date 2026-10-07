// 평가 항목 · 보완 연습 추천 (문구는 여기서 수정)
import{sessions}from'./curriculum.js';
export const MAX=10;
export const COLORS=['var(--gold)','var(--blue)','var(--green)','var(--red)'];
export const categories=[
  {name:'자세와 축의 안정성',items:['(기세)턱/시선 처리','아브라소/자세','피봇 & 턴 안정성'],
   tip:'꼼빠스 안의 미세한 체중이동·발끝 컨트롤(마이크로 무브먼트)과 등텐션 회전으로 축을 다듬어 보세요.',links:[['Practice Lab','#/practice']]},
  {name:'테크닉',items:['걷기와 멈춤','회전, (사까다)히로','강약 조절'],
   tip:'워킹 스피드업과 정지, 사까다 히로·엔로스께 회전을 회차별 루틴으로 반복해 보세요.',links:[['Practice Lab','#/practice']]},
  {name:'음악적 해석과 뉘앙스',items:['프레이즈','빠우사','악단별 특징 표현'],
   tip:'정박↔반박↔4박 빠우사 완급 전환 드릴로 박 변화에 반응하고, 곡의 쉼·프레이즈를 파형으로 확인해 보세요.',links:[['Rhythm Lab','#/rhythm'],['Music Lab','#/music']]},
  {name:'론다운용',items:['간격유지','공간운용(이탈)','진행능력'],
   tip:'공간 판단력(방향성)과 피구라 즉흥 결합 연습으로 간격 유지와 진행 능력을 키워 보세요.',links:[['Practice Lab','#/practice']]}
];
// 중간 점검일 (커리큘럼 기준)
export const checkpoints=()=>sessions.filter(s=>s.check).map(s=>({date:s.date,n:s.n,short:s.check.split('—')[0].trim()}));
// 점수가 낮은 항목 n개
export const weakest=(scores,n=2)=>scores.map((v,i)=>[v,i]).filter(x=>x[0]!=null&&x[0]!=='').sort((a,b)=>a[0]-b[0]||a[1]-b[1]).slice(0,n).map(x=>x[1]);
