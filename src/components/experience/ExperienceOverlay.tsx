"use client";
import {useEffect,useRef} from "react";
import {animate,createDrawable,createScope,createTimeline} from "animejs";
import type {ExperienceBridge} from "./experienceTypes";
import {ConnectorOverlay} from "./ConnectorOverlay";
import {range,smooth} from "./controllers/math";
type Beat={id:string;s:number;h:number;e:number;c:string;t:string;m?:string;latin?:string;p:string;g?:string};
const BEATS:Beat[]=[
 {id:"intro",s:0,h:.036,e:.064,c:"00 — البداية",t:"ماسة",m:"ليست مجرد حبة.\nحكاية من طبقات.",p:"hero"},
 {id:"hero",s:.075,h:.108,e:.134,c:"01 — الحبة",t:"حضورٌ يُرى.",m:"وتفاصيل تُسمع.",p:"right"},
 {id:"origin",s:.145,h:.174,e:.202,c:"02 — الأصل",t:"قرون.",m:"تختصرها حبة واحدة.",p:"left",g:"قرون"},
 {id:"craft",s:.214,h:.242,e:.27,c:"03 — الحرفة",t:"القرمشة تبدأ هنا.",m:"قشرة ذهبية، مصنوعة بدقة.",p:"right"},
 {id:"heart",s:.282,h:.31,e:.338,c:"04 — المكوّنات",t:"عجين رقيق.",m:"وفستق في القلب.",p:"left"},
 {id:"heat",s:.35,h:.377,e:.402,c:"05 — الحرارة",t:"ثم تأتي الحرارة.",m:"بهدوء، حتى تصبح الطبقات ذهبية.",p:"right"},
 {id:"syrup",s:.412,h:.435,e:.455,c:"06 — القَطْر",t:"واللمسة الأخيرة…",m:"القَطْر.",p:"left"},
 {id:"texture",s:.462,h:.48,e:.488,c:"07 — القرمشة",t:"تسمعها قبل أن تتذوقها.",p:"right"},
 {id:"inside",s:.5,h:.545,e:.574,c:"08 — داخل ماسة",t:"ماذا يوجد في الداخل؟",p:"top"},
 {id:"parts",s:.65,h:.672,e:.69,c:"09 — التفكيك",t:"خمس قطع.",m:"حبة واحدة.",p:"top"},
 {id:"map",s:.858,h:.872,e:.887,c:"09 — التفكيك",t:"البنية الفيزيائية.",p:"left"},
 {id:"rebuild",s:.9,h:.928,e:.958,c:"10 — إعادة البناء",t:"من خمس قطع…",m:"…إلى حبة واحدة.",p:"right"},
 {id:"final",s:.966,h:.986,e:1.01,c:"11 — الختام",t:"ماسة",m:"طبقات من الحرفة.\nحكاية في كل حبة.",latin:"TURKISH SWEETS",p:"final"}
];
const CHAPTERS=[
 {n:"00",v:"البداية",a:0},{n:"01",v:"الحبة",a:.075},{n:"02",v:"الأصل",a:.145},{n:"03",v:"الحرفة",a:.214},
 {n:"04",v:"المكوّنات",a:.282},{n:"05",v:"الحرارة",a:.35},{n:"06",v:"القَطْر",a:.412},{n:"07",v:"القرمشة",a:.462},
 {n:"08",v:"داخل ماسة",a:.5},{n:"09",v:"التفكيك",a:.58},{n:"10",v:"إعادة البناء",a:.9},{n:"11",v:"الختام",a:.966}
];
function Geometry(){return <svg className="brand-geometry" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
 <g className="desktop-geometry"><path className="draw intro-fragment" d="M530 112L600 38 670 112"/><path className="draw arc" d="M96 614C330 748 792 748 1096 538"/><path className="draw guide" d="M250 410H510C555 410 570 438 600 438S645 410 690 410H950"/></g>
 <g className="mobile-geometry"><path className="draw intro-fragment" d="M930 82L1010 158 954 222"/><path className="draw arc" d="M172 616C342 706 500 696 630 620"/></g>
 <g className="heart-diamond"><path className="draw rose-line" d="M600 220L735 385 600 570 465 385"/></g>
 </svg>}
export function ExperienceOverlay({bridge}:{bridge:ExperienceBridge;ready:boolean}){
 const root=useRef<HTMLDivElement>(null);
 useEffect(()=>{const el=root.current;if(!el)return;let raf=0;
  const scope=createScope({root:el,mediaQueries:{mobile:"(max-width:720px)",reduced:"(prefers-reduced-motion:reduce)"}}).add(()=>{el.querySelectorAll<SVGPathElement>(".draw").forEach((path,i)=>animate(createDrawable(path),{draw:["0 0","0 1"],duration:720+i*35,ease:"inOutCubic",autoplay:false}))});
  const timeline=createTimeline({autoplay:false});
  BEATS.forEach(beat=>{const node=el.querySelector<HTMLElement>(`[data-beat="${beat.id}"]`);if(!node)return;timeline.add(node,{"--show":[0,1],"--lift":["20px","0px"],"--clip":["0%","100%"],duration:Math.max(1,(beat.h-beat.s)*1000),ease:"outQuart"},beat.s*1000).add(node,{"--show":[1,0],"--lift":["0px","-14px"],"--clip":["100%","0%"],duration:Math.max(1,(beat.e-beat.h)*1000),ease:"inCubic"},beat.h*1000)});
  const draw=(q:string,v:number)=>el.querySelectorAll<SVGPathElement>(q).forEach(path=>path.style.strokeDashoffset=String(1-v));
  const tick=()=>{const p=bridge.progress.current.current,dark=smooth(range(p,.47,.59))*(1-smooth(range(p,.92,.99)));el.style.setProperty("--story",String(p));el.style.setProperty("--dark",String(dark));el.style.setProperty("--parallax",String((p-.5)*2));timeline.seek(p*1000);draw(".intro-fragment",Math.min(1,p/.045)*(1-smooth(range(p,.11,.15))));draw(".arc",smooth(range(p,.075,.12))*(1-smooth(range(p,.33,.39))));draw(".guide",smooth(range(p,.5,.54))*(1-smooth(range(p,.6,.65))));draw(".heart-diamond .draw",smooth(range(p,.775,.792))*(1-smooth(range(p,.805,.82))));const active=[...CHAPTERS].reverse().find(x=>p>=x.a)??CHAPTERS[0],name=el.querySelector("[data-rail-name]");if(name)name.textContent=active.v;raf=requestAnimationFrame(tick)};
  raf=requestAnimationFrame(tick);return()=>{cancelAnimationFrame(raf);timeline.revert();scope.revert()};
 },[bridge]);
 return <div ref={root} className="experience-overlay" dir="rtl"><Geometry/><header className="masthead"><span className="mast-diamond">◇</span><b>ماسة</b><small>TURKISH SWEETS</small></header><div className="scroll-cue"><span>مرّر لاكتشاف الحبة</span><i/></div>{BEATS.map(b=><section className={`story-beat beat-${b.p}`} data-beat={b.id} key={b.id}>{b.g&&<span className="ghost-word">{b.g}</span>}<small>{b.c}</small><div className="mask"><h1>{b.t}</h1></div>{b.m&&<p>{b.m}</p>}{b.latin&&<em>{b.latin}</em>}{b.id==="map"&&<ol className="ingredient-index physical-map" aria-label="التركيب الفيزيائي للحبة"><li>01 <b>القشرة العلوية</b></li><li>02 <b>رقائق العجين العلوية</b></li><li>03 <b>الفستق</b></li><li>04 <b>رقائق العجين السفلية</b></li><li>05 <b>القاعدة</b></li></ol>}</section>)}<ConnectorOverlay bridge={bridge}/><aside className="story-rail"><div className="rail-track"><i/></div><span className="rail-diamond">◇</span><b data-rail-name>البداية</b>{CHAPTERS.map(x=><small key={x.n} style={{"--at":x.a} as React.CSSProperties}>{x.n}</small>)}</aside></div>;
}
