"use client";
import { useEffect, useState } from "react";
import { ViewportMode } from "./responsiveScenes";

/**
 * Central device separation.
 *
 * The project's existing breakpoint system is 720px (used by every
 * `@media(max-width:720px)` rule in globals.css and by `viewportMode`).
 * We reuse it verbatim so the DOM, the connector overlay and the 3D stage
 * always agree. Resolved once per resize/orientation change, never per frame.
 */
export const MOBILE_BREAKPOINT = 720;
export const TABLET_BREAKPOINT = 1100;

export type DeviceConfig = {
  mode: ViewportMode;
  camera: {
    /** scroll-progress smoothing lambda (lower = smoother / more stable) */
    stageDamp: number;
    /** camera positional factors driving the cinematic parallax */
    posXFactor: number;
    posYFactor: number;
    posZFactor: number;
    targetXFactor: number;
    targetYFactor: number;
    /** camera.lookAt smoothing lambda */
    cameraDamp: number;
    /** camera Y during dissection: "profile" (from viewport profile) or fixed 0 */
    anatomyYMode: "profile" | "fixed";
    /** camera look target Y during dissection: "profile" or a fixed number */
    anatomyTargetY: number | "profile";
    /** extra camera Z depth applied once the dissection camera is active */
    anatomyOffsetZ: number;
    /**
     * When true the camera is stamped to its exact dissection pose as soon as
     * the explosion finishes and stays frozen for the whole inspection.
     */
    lockCameraInAnatomy: boolean;
  };
  model: {
    /** per-axis multipliers applied to the anatomical layer travel */
    explode: { scale: number; y: number; z: number };
  };
  explode: {
    /** progress window that drives compact -> fully exploded */
    start: number;
    end: number;
    /** progress window that drives fully exploded -> compact */
    reconstructStart: number;
    reconstructEnd: number;
    /** exact-state snap thresholds (>= snapOpen -> 1, <= snapClosed -> 0) */
    snapOpen: number;
    snapClosed: number;
  };
  connector: {
    /** fraction of viewport width used as the safe margin around labels */
    marginOf: number;
    /** fraction of viewport width reserved for the label column */
    labelWidthOf: number;
    /** mobile shows one connector + the follow-label layout */
    follow: boolean;
  };
  spin: {
    /** seconds for a full 360° turntable revolution (idle auto-spin) */
    revolutionsSeconds: number;
    /** seconds of easing while aligning toward the readable front angle */
    alignSeconds: number;
    /** how much earlier than PRE_ANATOMY.start the spin must stop and align */
    stopOffset: number;
    /**
     * When true the spin angle is force-frozen at the front angle the moment
     * the explosion starts so auto-spin and explosion never overlap on mobile.
     */
    hardLockAtExplode: boolean;
  };
  scroll: {
    /** same as camera.stageDamp — kept here for one obvious place to tune it */
    stageDamp: number;
  };
};

export const DESKTOP_CONFIG: DeviceConfig = {
  mode: "desktop",
  camera: {
    stageDamp: 16,
    posXFactor: 0.1,
    posYFactor: 0.065,
    posZFactor: 0.1,
    targetXFactor: 0.14,
    targetYFactor: 0.1,
    cameraDamp: 9,
    anatomyYMode: "fixed",
    anatomyTargetY: -0.12,
    anatomyOffsetZ: 0.18,
    lockCameraInAnatomy: true,
  },
  model: {
    explode: { scale: 1, y: 1, z: 1 },
  },
  explode: {
    start: 0.58,
    end: 0.595,
    reconstructStart: 0.89,
    reconstructEnd: 0.905,
    snapOpen: 0.98,
    snapClosed: 0.02,
  },
  connector: {
    marginOf: 0.04,
    labelWidthOf: 0.29,
    follow: false,
  },
  spin: {
    revolutionsSeconds: 14,
    alignSeconds: 0.45,
    stopOffset: 0,
    hardLockAtExplode: false,
  },
  scroll: {
    stageDamp: 16,
  },
};

export const MOBILE_CONFIG: DeviceConfig = {
  mode: "mobile",
  camera: {
    stageDamp: 14,
    posXFactor: 0.07,
    posYFactor: 0.045,
    posZFactor: 0.07,
    targetXFactor: 0.1,
    targetYFactor: 0.075,
    cameraDamp: 9,
    anatomyYMode: "profile",
    anatomyTargetY: "profile",
    anatomyOffsetZ: 0.18,
    lockCameraInAnatomy: true,
  },
  model: {
    // Calibrated portrait layout. Each axis is a multiplier layered on the
    // viewport profile values (mobile: x=profile.explosion, y=profile.anatomySpacing)
    // so the exploded composition keeps its existing tuning, not a guess.
    explode: { scale: 1, y: 1, z: 0.78 },
  },
  explode: {
    // Same narrow progress span as desktop for a symmetric fast transition.
    start: 0.58,
    end: 0.595,
    reconstructStart: 0.89,
    reconstructEnd: 0.905,
    snapOpen: 0.97,
    snapClosed: 0.03,
  },
  connector: {
    marginOf: 0.04,
    labelWidthOf: 0.29,
    follow: true,
  },
  spin: {
    revolutionsSeconds: 14,
    alignSeconds: 0.45,
    // Stop the turntable before the dissection beat so the model aligns to
    // the readable front angle and is fully stable before the explosion.
    stopOffset: -0.012,
    hardLockAtExplode: true,
  },
  scroll: {
    stageDamp: 14,
  },
};

export const TABLET_CONFIG: DeviceConfig = {
  ...DESKTOP_CONFIG,
  mode: "tablet",
  // Tablets keep desktop interaction patterns but get the same slightly
  // smoother progress damping as phones so short scroll deltas feel calm.
  camera: { ...DESKTOP_CONFIG.camera, stageDamp: 15 },
  scroll: { stageDamp: 15 },
};

export const MODE_CONFIG: Readonly<Record<ViewportMode, DeviceConfig>> = {
  mobile: MOBILE_CONFIG,
  tablet: TABLET_CONFIG,
  desktop: DESKTOP_CONFIG,
};

/** Pure width resolver for the R3F stage (matches the CSS media breakpoints). */
export function getWidthMode(width: number): ViewportMode {
  return width <= MOBILE_BREAKPOINT
    ? "mobile"
    : width < TABLET_BREAKPOINT
      ? "tablet"
      : "desktop";
}

/** React hook for DOM components; resolves once and re-evaluates on resize/orientation change only. */
export function useResponsiveBreakpoint() {
  const [mode, setMode] = useState<ViewportMode>(() =>
    typeof window === "undefined"
      ? "desktop"
      : getWidthMode(window.innerWidth),
  );
  useEffect(() => {
    const check = () =>
      setMode(
        typeof window === "undefined" ? "desktop" : getWidthMode(window.innerWidth),
      );
    check();
    addEventListener("resize", check);
    addEventListener("orientationchange", check);
    return () => {
      removeEventListener("resize", check);
      removeEventListener("orientationchange", check);
    };
  }, []);
  return { mode, isMobile: mode === "mobile" };
}
