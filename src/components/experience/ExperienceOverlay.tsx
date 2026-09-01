"use client";
import {useEffect,useRef} from "react";
import {animate,createDrawable,createScope,createTimeline} from "animejs";
import type {ExperienceBridge} from "./experienceTypes";
import {ConnectorOverlay} from "./ConnectorOverlay";
import {range,smooth} from "./controllers/math";
type Beat={id:string;s:number;h:number;e:number;c:string;t:string;m?:string;p:string;g?:string};
const BEATS:Beat[]=[
 {id:"masa",s:0,h:.045,e:.07,c:"01 — ماسة",t:"ماسة",m:"حبة تحمل حكاية أطول.",p:"hero"},
 {id:"view-2",s:.08,h:.105,e:.135,c:"02 — الحبة",t:"شكلٌ من الحرفة.",m:"من كل زاوية، تفصيل.",p:"right"},
 {id:"view-3",s:.145,h:.17,e:.195,c:"02 — الحبة",t:"ذهبٌ يُرى.",m:"وقرمشةٌ تُسمع.",p:"left"},
 {id:"story-1",s:.215,h:.245,e:.275,c:"03 — الحكاية",t:"قرون.",m:"تختصرها حبة واحدة.",p:"right",g:"قرون"},
 {id:"story-2",s:.285,h:.315,e:.34,c:"03 — الحكاية",t:"عجين رقيق.",m:"وفستق في القلب.",p:"left"},
 {id:"story-3",s:.355,h:.385,e:.41,c:"03 — الحكاية",t:"حرارة تغيّر القوام.",p:"right"},
 {id:"story-4",s:.425,h:.45,e:.475,c:"03 — الحكاية",t:"والقَطْرُ",m:"يكمل الحبة.",p:"left"},
 {id:"inside",s:.49,h:.545,e:.575,c:"04 — داخل ماسة",t:"ماذا يوجد في الداخل؟",p:"top"},
 {id:"parts",s:.65,h:.67,e:.688,c:"05 — التفكيك",t:"خمس قطع.",m:"حبة واحدة.",p:"top"},
 {id:"map",s:.86,h:.872,e:.885,c:"05 — التفكيك",t:"البنية الفيزيائية.",p:"left"},
 {id:"rebuild",s:.9,h:.925,e:.958,c:"06 — الختام",t:"من خمس قطع…",m:"…إلى حبة واحدة.",p:"right"},
 {id:"final",s:.965,h:.985,e:1.01,c:"06 — الختام",t:"ماسة",m:"TURKISH SWEETS",p:"final"}
];
const CHAPTERS=[{n:"01",v:"ماسة",a:0},{n:"02",v:"الحبة",a:.08},{n:"03",v:"الحكاية",a:.215},{n:"04",v:"داخل ماسة",a:.49},{n:"05",v:"التفكيك",a:.58},{n:"06",v:"الختام",a:.955}];
function Geometry(){return <svg className="brand-geometry" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
 <g className="desktop-geometry"><path className="draw intro-fragment" d="M530 112L600 38 670 112"/><path className="draw arc" d="M80 610C320 770 780 765 1090 545"/><path className="draw guide" d="M180 410H510C555 410 570 438 600 438S645 410 690 410H1020"/></g>
 <g className="mobile-geometry"><path className="draw intro-fragment" d="M900 80L1010 178 930 258"/><path className="draw arc" d="M120 590C330 720 520 706 670 610"/></g>
 <g className="heart-diamond"><path className="draw rose-line" d="M600 220L735 385 600 570 465 385"/></g>
 </svg>}
export function ExperienceOverlay({bridge}:{bridge:ExperienceBridge;ready:boolean}){
 const root=useRef<HTMLDivElement>(null);
 useEffect(()=>{const el=root.current;if(!el)return;let raf=0;
  const scope=createScope({root:el,mediaQueries:{mobile:"(max-width:720px)",reduced:"(prefers-reduced-motion:reduce)"}}).add(()=>{el.querySelectorAll<SVGPathElement>(".draw").forEach((path,i)=>animate(createDrawable(path),{draw:["0 0","0 1"],duration:800+i*35,ease:"inOutCubic",autoplay:false}))});
  const nodes=BEATS.map(b=>el.querySelector<HTMLElement>(`[data-beat="${b.id}"]`));
  const textTimeline=createTimeline({autoplay:false});
  BEATS.forEach((beat,index)=>{const node=nodes[index];if(!node)return;textTimeline.add(node,{"--show":[0,1],"--lift":["18px","0px"],duration:Math.max(1,(beat.h-beat.s)*1000),ease:"outCubic"},beat.s*1000).add(node,{"--show":[1,0],"--lift":["0px","-12px"],duration:Math.max(1,(beat.e-beat.h)*1000),ease:"inCubic"},beat.h*1000)});
  const draw=(q:string,v:number)=>el.querySelectorAll<SVGPathElement>(q).forEach(path=>path.style.strokeDashoffset=String(1-v));
  const tick=()=>{const p=bridge.progress.current.current,dark=smooth(range(p,.43,.58))*(1-smooth(range(p,.925,.99)));el.style.setProperty("--story",String(p));el.style.setProperty("--dark",String(dark));textTimeline.seek(p*1000);
   draw(".intro-fragment",Math.min(1,p/.045)*(1-smooth(range(p,.1,.15))));
   draw(".arc",smooth(range(p,.07,.12))*(1-smooth(range(p,.38,.46))));
   draw(".guide",smooth(range(p,.49,.54))*(1-smooth(range(p,.60,.65))));
   draw(".heart-diamond .draw",smooth(range(p,.775,.792))*(1-smooth(range(p,.805,.82))));
   const active=[...CHAPTERS].reverse().find(x=>p>=x.a)??CHAPTERS[0],name=el.querySelector("[data-rail-name]");if(name)name.textContent=active.v;raf=requestAnimationFrame(tick)};
  raf=requestAnimationFrame(tick);return()=>{cancelAnimationFrame(raf);textTimeline.revert();scope.revert()};
 },[bridge]);
 return <div ref={root} className="experience-overlay" dir="rtl"><Geometry/><header className="masthead"><span className="mast-diamond">◇</span><b>ماسة</b><small>TURKISH SWEETS</small></header><div className="scroll-cue"><span>مرّر لاكتشاف الحبة</span><i/></div>{BEATS.map(b=><section className={`story-beat beat-${b.p}`} data-beat={b.id} key={b.id}>{b.g&&<span className="ghost-word">{b.g}</span>}<small>{b.c}</small><div className="mask"><h1>{b.t}</h1></div>{b.m&&<p>{b.m}</p>}{b.id==="map"&&<ol className="ingredient-index physical-map" aria-label="التركيب الفيزيائي للحبة"><li>01 <b>القشرة العلوية</b></li><li>02 <b>رقائق العجين العلوية</b></li><li>03 <b>الفستق</b></li><li>04 <b>رقائق العجين السفلية</b></li><li>05 <b>القاعدة</b></li></ol>}</section>)}<ConnectorOverlay bridge={bridge}/><aside className="story-rail"><div className="rail-track"><i/></div><span className="rail-diamond">◇</span><b data-rail-name>ماسة</b>{CHAPTERS.map(x=><small key={x.n} style={{"--at":x.a} as React.CSSProperties}>{x.n}</small>)}</aside></div>;
}
