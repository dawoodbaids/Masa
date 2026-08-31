"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ExperienceBridge } from "./experienceTypes";
import { ExperienceOverlay } from "./ExperienceOverlay";
import { useExperienceProgress } from "./controllers/useExperienceProgress";
import { experienceConfig } from "./content/experienceConfig";
const ExperienceCanvas = dynamic(() => import("./ExperienceCanvas").then((m) => m.ExperienceCanvas), { ssr: false });

export function MasaExperience() {
  const track = useRef<HTMLElement>(null);
  const progress = useExperienceProgress(track);
  const anchors = useRef<ExperienceBridge["anchors"]["current"]>({});
  const pastry = useRef<ExperienceBridge["pastry"]["current"]>({});
  const camera = useRef<ExperienceBridge["camera"]["current"]>(null);
  const ready = useRef<ExperienceBridge["ready"]["current"]>({ pastry: false, failed: false });
  const [pastryReady, setPastryReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const bridge = useMemo<ExperienceBridge>(() => ({ progress, anchors, pastry, camera, ready }), [progress]);
  const reveal = useCallback(() => { if (ready.current.pastry) return; if (ready.current.failed) setFailed(true); ready.current.pastry = true; progress.current.locked = false; let initial = 0; if (process.env.NODE_ENV === "development") { const forced = Number(new URLSearchParams(location.search).get("progress")); if (Number.isFinite(forced)) initial = Math.min(1, Math.max(0, forced)); } progress.current.current = initial; progress.current.target = initial; setPastryReady(true); }, [progress]);
  useEffect(() => { if (process.env.NODE_ENV === "development") console.debug("[Masa] component mounted"); }, []);
  useEffect(() => { document.body.classList.toggle("experience-loading", !pastryReady); return () => document.body.classList.remove("experience-loading"); }, [pastryReady]);
  return (
    <main ref={track} className={`experience-track ${pastryReady ? "is-ready" : "is-loading"}`} aria-label="ماسة — رحلة داخل حبة البقلاوة">
      <div className="experience-sticky">
        <ExperienceCanvas bridge={bridge} onPastryReady={reveal} />
        <ExperienceOverlay bridge={bridge} ready={pastryReady} />
        {failed ? <div className="model-fallback" dir="rtl"><strong>ماسة</strong><p>تعذّر تحميل المجسّم. يمكنك متابعة الحكاية النصية وإعادة المحاولة بتحديث الصفحة.</p></div> : null}
        <div className="loading-gate" aria-live="polite" aria-label={pastryReady ? "اكتمل التحميل" : "جارٍ تحميل التجربة"}>
          <strong>ماسة</strong><i />
        </div>
        <noscript><section className="nojs-fallback" dir="rtl"><strong>ماسة</strong><p>حبة بقلاوة تحمل بين طبقاتها حكايةً من الحرفة والوقت.</p><a href={experienceConfig.contact.url}>{experienceConfig.contact.label}</a></section></noscript>
      </div>
    </main>
  );
}
