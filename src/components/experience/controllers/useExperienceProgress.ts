"use client";

import { RefObject, useEffect, useRef } from "react";

export type ProgressStore = {
  current: number;
  target: number;
  reduced: boolean;
  locked: boolean;
};

export function useExperienceProgress(track: RefObject<HTMLElement | null>) {
  const store = useRef<ProgressStore>({ current: 0, target: 0, reduced: false, locked: true });

  useEffect(() => {
    if (process.env.NODE_ENV === "development") console.debug("[Masa] scroll system initialized");
    let loggedScroll = false;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const setReduced = () => (store.current.reduced = media.matches);
    let frame = 0;
    const update = () => {
      if (process.env.NODE_ENV === "development" && !loggedScroll && scrollY > 0) { loggedScroll = true; console.debug("[Masa] first scroll event", { scrollY }); }
      if (store.current.locked) { store.current.current = 0; store.current.target = 0; return; }
      if (process.env.NODE_ENV === "development") {
        const forced = new URLSearchParams(location.search).get("progress");
        if (forced !== null && Number.isFinite(Number(forced))) {
          store.current.target = Math.min(1, Math.max(0, Number(forced)));
          store.current.current = store.current.target;
          return;
        }
      }
      const el = track.current;
      if (!el) return;
      const travel = Math.max(1, el.offsetHeight - innerHeight);
      store.current.target = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / travel));
    };
    const scheduleUpdate = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => { frame = 0; update(); });
    };
    setReduced();
    update();
    media.addEventListener("change", setReduced);
    addEventListener("scroll", scheduleUpdate, { passive: true });
    addEventListener("resize", scheduleUpdate);
    return () => {
      media.removeEventListener("change", setReduced);
      cancelAnimationFrame(frame);
      removeEventListener("scroll", scheduleUpdate);
      removeEventListener("resize", scheduleUpdate);
    };
  }, [track]);

  return store;
}
