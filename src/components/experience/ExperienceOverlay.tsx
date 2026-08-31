"use client";
import {useEffect,useRef} from "react";
import {storyMoments} from "./content/story";
import {range,smooth} from "./controllers/math";
import type {ExperienceBridge} from "./experienceTypes";
import {ConnectorOverlay} from "./ConnectorOverlay";
import {ExperienceCTA} from "./ExperienceCTA";
const held=(p:number,start:number,hold:number,end:number)=>{const value=smooth(range(p,start,hold))*(1-smooth(range(p,end-.0025,end)));return value<.035?0:Math.max(.15,.15+.85*smooth(range(value,.035,.55)))};
const arabicPercent=(value:number)=>`${Math.round(value*100)}٪`.replace(/\d/g,d=>"٠١٢٣٤٥٦٧٨٩"[Number(d)]);
export function ExperienceOverlay({bridge,ready}:{bridge:ExperienceBridge;ready:boolean}){const root=useRef<HTMLDivElement>(null);useEffect(()=>{if(!ready)return;const element=root.current;if(!element)return;const moments=storyMoments.map(moment=>element.querySelector<HTMLElement>(`[data-moment="${moment.id}"]`)),percent=element.querySelector<HTMLElement>("[data-progress-percent]");let raf=0;const update=()=>{const p=bridge.progress.current.current;element.style.setProperty("--progress",String(p));if(percent)percent.textContent=arabicPercent(p);storyMoments.forEach((moment,index)=>moments[index]?.style.setProperty("--show",String(held(p,moment.start,moment.hold,moment.end))));element.style.setProperty("--hero-show",String(1-smooth(range(p,.008,.02))));element.style.setProperty("--pre-show",String(held(p,.525,.535,.558)));element.style.setProperty("--explosion-show",String(held(p,.58,.59,.64)));element.style.setProperty("--beauty-show",String(held(p,.86,.867,.89)));element.style.setProperty("--rebuild-show",String(held(p,.89,.9,.952)));element.style.setProperty("--finale-show",String(held(p,.962,.972,.995)));element.style.setProperty("--cta-show",String(smooth(range(p,.996,.999))));raf=requestAnimationFrame(update)};raf=requestAnimationFrame(update);return()=>cancelAnimationFrame(raf)},[bridge,ready]);return <div ref={root} className="experience-overlay overlay-ready" dir="rtl">
 <header className="brand"><span>ماسة</span><i/></header>
 <section className="hero-copy"><small>٠١ · ماسة</small><p><span className="hero-word">ماسة</span></p><h1><span className="hero-word">حبة،</span> <span className="hero-word">تحمل</span> <span className="hero-word">حكايةً</span> <span className="hero-word">أطول.</span></h1><em>مرّر لتتبع رحلتها</em></section>
 {storyMoments.map(moment=><article className={`story-station station-${moment.station}`} data-moment={moment.id} key={moment.id}>{moment.word?<span className="station-word">{moment.word}</span>:null}<div className="chapter-line">{moment.chapter}</div><h2>{moment.title}</h2><p>{moment.body}</p></article>)}
 <section className="pre-anatomy"><small>٢١ · من الحكاية إلى الداخل</small><strong>لنفتح الحبة</strong></section>
 <section className="explosion-copy"><small>٢٢ · التفكك</small><strong>خمس قطع.<br/>حبة واحدة.</strong></section>
 <ConnectorOverlay bridge={bridge}/>
 <section className="beauty-copy"><small>٢٨ · المشهد الكامل</small><strong>خمسة أجزاء<br/>تعود إلى ترتيب واحد.</strong></section>
 <section className="rebuild-copy"><small>٢٩ · إعادة البناء</small><strong>طبقة فوق طبقة،<br/>تغلق الحبة من جديد.</strong></section>
 <section className="finale"><div><small>٣٠ · النهاية</small><p>بدأت الحكاية قبل أن تصل إلينا بوقت طويل.<br/>تغيرت الأشكال والوصفات والأماكن.<br/>لكن الفكرة بقيت طبقة فوق طبقة.<br/>وفي النهاية… حبة واحدة.</p></div><strong>ماسة</strong><em>طبقات كثيرة. حكاية واحدة.</em></section>
 <ExperienceCTA/><div className="progress-rail"><i/><small data-progress-percent>٠٪</small></div>
 </div>}
