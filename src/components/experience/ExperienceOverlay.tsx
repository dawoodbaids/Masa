"use client";
import { animate, stagger } from "animejs";
import { useEffect, useRef } from "react";
import { storyMoments } from "./content/story";
import { bell, range, smooth } from "./controllers/math";
import type { ExperienceBridge } from "./experienceTypes";
import { ConnectorOverlay } from "./ConnectorOverlay";

export function ExperienceOverlay({ bridge, ready }: { bridge: ExperienceBridge; ready: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!ready) return; animate(".hero-word", { opacity: [0, 1], y: [24, 0], duration: 1350, delay: stagger(95), ease: "outExpo" }); const element = root.current; if (!element) return; const momentEls = storyMoments.map((m) => element.querySelector<HTMLElement>(`[data-moment="${m.id}"]`)); let raf = 0; const update = () => { const p = bridge.progress.current.current; element.style.setProperty("--progress", String(p)); storyMoments.forEach((moment, index) => { const el = momentEls[index]; if (!el) return; const show = bell(p, moment.start, moment.peak, moment.end); el.style.setProperty("--show", String(show)); el.style.setProperty("--travel", `${(1 - show) * 28}px`); }); element.style.setProperty("--hero-show", String(1 - smooth(range(p, .012, .052)))); element.style.setProperty("--anatomy-show", String(bell(p, .515, .555, .61))); element.style.setProperty("--summary-show", String(bell(p, .855, .875, .9))); element.style.setProperty("--rebuild-show", String(bell(p, .89, .92, .952))); element.style.setProperty("--finale-show", String(smooth(range(p, .958, .982)))); raf = requestAnimationFrame(update); }; raf = requestAnimationFrame(update); return () => cancelAnimationFrame(raf); }, [bridge, ready]);
  return <div ref={root} className={`experience-overlay ${ready ? "overlay-ready" : ""}`}>
    <header className="brand"><span>ماسة</span><i /></header>
    <div className="hero-copy"><small>الحبة التي تحمل الحكاية</small><p><span className="hero-word">حكاية</span> <span className="hero-word">تُروى</span></p><p><span className="hero-word">طبقةً</span> <span className="hero-word">بعد</span> <span className="hero-word">طبقة</span></p><em>مرّر ببطء لتسافر معها</em></div>
    {storyMoments.map((moment) => <article className={`story-moment ${moment.align}`} data-moment={moment.id} key={moment.id}><div className="chapter-line"><span>{moment.chapter}</span>{moment.era ? <b>{moment.era}</b> : null}</div><h2>{moment.title}</h2>{moment.body ? <p>{moment.body}</p> : null}</article>)}
    <div className="anatomy-title"><small>داخل الحبة</small><strong>ثلاث عشرة طبقة.<br />كل واحدة تؤدي دورًا.</strong></div>
    <ConnectorOverlay bridge={bridge} />
    <div className="anatomy-summary"><small>البناء كاملًا</small><p>قشرة، ورقائق، وقلب من الفستق،<br />ثم رقائق وقاعدة تحملها جميعًا.</p></div>
    <div className="rebuild-copy"><span>طبقة.</span><span>ثم أخرى.</span><span>حتى تعود حبة واحدة.</span></div>
    <div className="finale"><div><small>بدأت الحكاية قبل قرون</small><p>مرّت بين المطابخ والمدن والأجيال.<br />طبقة فوق طبقة، حتى وصلت إلى هنا.</p></div><strong>ماسة</strong><em>طبقات كثيرة. حكاية واحدة.</em></div>
    <div className="progress-rail"><i /></div>
  </div>;
}
