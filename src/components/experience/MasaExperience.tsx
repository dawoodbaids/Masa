"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useProgress } from "@react-three/drei";
import type { ExperienceBridge } from "./experienceTypes";
import { ExperienceOverlay } from "./ExperienceOverlay";
import { useExperienceProgress } from "./controllers/useExperienceProgress";
import { experienceConfig } from "./content/experienceConfig";
function ModelLoader({ hidden }: { hidden: boolean }) {
  const progress = useProgress((state) => state.progress);
  const visibleProgress = progress > 0 && progress < 100 ? Math.round(progress) : null;
  return (
    <div className={`model-loader ${hidden ? "is-hidden" : ""}`} aria-live="polite" aria-hidden={hidden}>
      <strong>ماسة</strong>
      <span>تحميل الحبة...</span>
      <i><b style={{ transform: `scaleX(${visibleProgress === null ? 0.24 : visibleProgress / 100})` }} /></i>
      {visibleProgress === null ? null : <small>{visibleProgress}%</small>}
    </div>
  );
}

const ExperienceCanvas = dynamic(() => import("./ExperienceCanvas").then((m) => m.ExperienceCanvas), {
  ssr: false,
  loading: () => null,
});

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
  const reveal = useCallback(() => { if (ready.current.pastry) return; ready.current.pastry = true; progress.current.locked = false; let initial = 0; if (process.env.NODE_ENV === "development") { const forced = Number(new URLSearchParams(location.search).get("progress")); if (Number.isFinite(forced)) initial = Math.min(1, Math.max(0, forced)); } progress.current.current = initial; progress.current.target = initial; setPastryReady(true); }, [progress]);
  const handleFailure = useCallback(() => { ready.current.failed = true; setFailed(true); }, []);
  useEffect(() => { if (process.env.NODE_ENV === "development") console.debug("[Masa] component mounted"); }, []);
  return (
    <main ref={track} className={`experience-track ${pastryReady ? "is-ready" : "is-loading"}`} aria-label="ماسة — رحلة داخل حبة البقلاوة">
      <div className="experience-sticky">
        <ExperienceCanvas bridge={bridge} onPastryReady={reveal} onFailure={handleFailure} />
        <ExperienceOverlay bridge={bridge} ready={pastryReady} />
        {failed ? <div className="model-fallback" dir="rtl"><strong>تعذر تحميل المجسم</strong><button type="button" onClick={() => location.reload()}>إعادة المحاولة</button></div> : <ModelLoader hidden={pastryReady} />}
        <noscript><section className="nojs-fallback" dir="rtl"><strong>ماسة</strong><p>حبة بقلاوة تحمل بين طبقاتها حكايةً من الحرفة والوقت.</p><a href={experienceConfig.contact.url}>{experienceConfig.contact.label}</a></section></noscript>
      </div>
    </main>
  );
}
