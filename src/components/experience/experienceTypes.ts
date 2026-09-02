import type { ProgressStore } from "./controllers/useExperienceProgress";
export type ReadyStore = { pastry: boolean; failed: boolean };
export type ExperienceBridge = { progress: React.MutableRefObject<ProgressStore>; ready: React.MutableRefObject<ReadyStore> };
