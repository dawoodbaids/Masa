"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ExperienceBridge } from "./experienceTypes";
import { ExperienceOverlay } from "./ExperienceOverlay";
import { useExperienceProgress } from "./controllers/useExperienceProgress";
const ExperienceCanvas = dynamic(() => import("./ExperienceCanvas").then((m) => m.ExperienceCanvas), { ssr: false });

export function MasaExperience() {
  const track = useRef<HTMLElement>(null);
  const progress = useExperienceProgress(track);
  const anchors = useRef<ExperienceBridge["anchors"]["current"]>({});
  const anatomy = useRef<ExperienceBridge["anatomy"]["current"]>({});
  const camera = useRef<ExperienceBridge["camera"]["current"]>(null);
  const ready = useRef<ExperienceBridge["ready"]["current"]>({ hero: false, anatomy: false, failed: false });
  const [heroReady, setHeroReady] = useState(false);
  const bridge = useMemo<ExperienceBridge>(() => ({ progress, anchors, anatomy, camera, ready }), [progress]);
  const reveal = useCallback(() => { if (ready.current.hero) return; ready.current.hero = true; progress.current.locked = false; let initial = 0; if (process.env.NODE_ENV === "development") { const forced = Number(new URLSearchParams(location.search).get("progress")); if (Number.isFinite(forced)) initial = Math.min(1, Math.max(0, forced)); } progress.current.current = initial; progress.current.target = initial; setHeroReady(true); }, [progress]);
  useEffect(() => { document.body.classList.toggle("experience-loading", !heroReady); return () => document.body.classList.remove("experience-loading"); }, [heroReady]);
  return (
    <main ref={track} className={`experience-track ${heroReady ? "is-ready" : "is-loading"}`} aria-label="ماسة — رحلة داخل حبة البقلاوة">
      <div className="experience-sticky">
        <ExperienceCanvas bridge={bridge} heroReady={heroReady} onHeroReady={reveal} />
        <ExperienceOverlay bridge={bridge} ready={heroReady} />
        <div className="loading-gate" aria-live="polite" aria-label={heroReady ? "اكتمل التحميل" : "جارٍ تحميل التجربة"}>
          <strong>ماسة</strong><i />
        </div>
        <noscript>تحتاج هذه التجربة التفاعلية إلى جافاسكربت.</noscript>
      </div>
    </main>
  );
}
