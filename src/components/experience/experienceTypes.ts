import type { Camera, Object3D } from "three";
import type { MeshName } from "./content/story";
import type { ProgressStore } from "./controllers/useExperienceProgress";
export type AnchorMap = Partial<Record<MeshName, { x: number; y: number }>>;
export type ReadyStore = { pastry: boolean; failed: boolean };
export type ExperienceBridge = { progress: React.MutableRefObject<ProgressStore>; anchors: React.MutableRefObject<AnchorMap>; pastry: React.MutableRefObject<Partial<Record<MeshName, Object3D>>>; camera: React.MutableRefObject<Camera | null>; ready: React.MutableRefObject<ReadyStore> };
