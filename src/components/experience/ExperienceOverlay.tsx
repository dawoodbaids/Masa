"use client";
import {animate,stagger} from "animejs";
import {useEffect,useRef} from "react";
import {storyMoments} from "./content/story";
import {range,smooth} from "./controllers/math";
import type {ExperienceBridge} from "./experienceTypes";
import {ConnectorOverlay} from "./ConnectorOverlay";
import {ExperienceCTA} from "./ExperienceCTA";
const rawHeld=(p:number,start:number,hold:number,end:number)=>smooth(range(p,start,hold))*(1-smooth(range(p,end-.0025,end)));
const held=(p:number,start:number,hold:number,end:number)=>{const value=rawHeld(p,start,hold,end);return value<.035?0:Math.max(.15,.15+.85*smooth(range(value,.035,.55)))};
const arabicPercent=(value:number)=>`${Math.round(value*100)}٪`.replace(/\d/g,d=>"٠١٢٣٤٥٦٧٨٩"[Number(d)]);
export function ExperienceOverlay({bridge,ready}:{bridge:ExperienceBridge;ready:boolean}){
 const root=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(!ready)return;animate(".hero-word",{opacity:[0,1],y:[18,0],duration:1050,delay:stagger(90),ease:"outExpo"});const element=root.current;if(!element)return;const moments=storyMoments.map(m=>element.querySelector<HTMLElement>(`[data-moment="${m.id}"]`)),percent=element.querySelector<HTMLElement>("[data-progress-percent]");let raf=0;const update=()=>{const p=bridge.progress.current.current;element.style.setProperty("--progress",String(p));if(percent)percent.textContent=arabicPercent(p);storyMoments.forEach((m,i)=>moments[i]?.style.setProperty("--show",String(held(p,m.start,m.hold,m.end))));element.style.setProperty("--hero-show",String(1-smooth(range(p,.008,.022))));element.style.setProperty("--alone-show",String(held(p,.405,.412,.425)));element.style.setProperty("--opening-show",String(held(p,.438,.45,.525)));element.style.setProperty("--macro-summary",String(held(p,.625,.63,.64)));element.style.setProperty("--upper-intro",String(held(p,.635,.642,.675)));element.style.setProperty("--pistachio-chapter",String(held(p,.75,.755,.79)));element.style.setProperty("--lower-intro",String(held(p,.79,.797,.835)));element.style.setProperty("--return-show",String(held(p,.91,.918,.948)));element.style.setProperty("--rebuild-show",String(held(p,.948,.955,.982)));element.style.setProperty("--finale-show",String(held(p,.989,.992,.997)));element.style.setProperty("--cta-show",String(smooth(range(p,.996,.999))));raf=requestAnimationFrame(update)};raf=requestAnimationFrame(update);return()=>cancelAnimationFrame(raf)},[bridge,ready]);
 return <div ref={root} className={`experience-overlay ${ready?"overlay-ready":""}`} dir="rtl">
  <header className="brand"><span>ماسة</span><i/></header>
  <section className="hero-copy"><small>الفصل الأول</small><p><span className="hero-word">ماسة</span></p><h1><span className="hero-word">حبةٌ</span> <span className="hero-word">تحمل</span> <span className="hero-word">حكايةً</span> <span className="hero-word">أطول.</span></h1><em>مرّر لتتبع رحلتها</em></section>
  {storyMoments.map(m=><article className={`story-station station-${m.station}`} data-moment={m.id} key={m.id}>{m.word?<span className="station-word">{m.word}</span>:null}<div className="chapter-line">{m.chapter}</div><h2>{m.title}</h2><p>{m.body}</p>{m.detail?<small>{m.detail}</small>:null}</article>)}
  <section className="alone-copy"><small>وصلنا إلى الداخل</small><strong>لنفتح الحبة.</strong></section>
  <section className="opening-copy"><small>داخل ماسة</small><strong>لحظة التفكك</strong><p>خمس كتل. ثلاث عشرة قطعة.</p></section>
  <ConnectorOverlay bridge={bridge}/>
  <section className="macro-summary"><small>هذه هي البنية من بعيد</small><strong>قشرة علوية<br/>رقائق علوية × ٥<br/>فستق<br/>رقائق سفلية × ٥<br/>قاعدة</strong><b>الآن نقترب.</b></section>
  <section className="analysis-intro upper-intro"><small>المستوى الثاني · الرقائق العلوية</small><strong>رصّة واحدة أولًا.<br/>ثم خمس أوراق منفصلة.</strong></section>
  <section className="analysis-intro pistachio-chapter"><small>في قلب الحبة</small><strong>الفستق وحده.</strong></section>
  <section className="analysis-intro lower-intro"><small>المستوى الثاني · الرقائق السفلية</small><strong>رصّة واحدة أولًا.<br/>ثم خمس أوراق منفصلة.</strong></section>
  <section className="return-copy"><small>كل ما رأيناه يعود إلى مكانه</small><strong>البنية كاملة من جديد.</strong></section>
  <section className="rebuild-copy"><span>القاعدة ترتفع</span><span>الرّصّة السفلى تستقر</span><span>الفستق يعود إلى القلب</span><span>الرّصّة العليا تُغلق</span><b>ثم تعود ماسة حبة واحدة.</b></section>
  <section className="finale"><div><small>من تاريخ طويل إلى حبة أمامنا</small><p>رقائق، وفستق، ونار، ووقت.<br/>كلها عادت إلى شكل واحد.</p></div><strong>ماسة</strong><em>طبقات كثيرة. حكاية واحدة.</em></section>
  <ExperienceCTA/><div className="progress-rail"><i/><small data-progress-percent>٠٪</small></div>
 </div>
}
