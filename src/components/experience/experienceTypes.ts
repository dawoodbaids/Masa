import type { Camera, Object3D } from "three";
import type { MeshName } from "./content/story";
import type { ProgressStore } from "./controllers/useExperienceProgress";
export type AnchorPoint={x:number;y:number;r:number;cx?:number;cy?:number;name?:string;side?:"left"|"right"};
export type AnchorMap = Partial<Record<MeshName, AnchorPoint>>;
export type ReadyStore = { pastry: boolean; failed: boolean };
export type ExperienceBridge = { progress: React.MutableRefObject<ProgressStore>; anchors: React.MutableRefObject<AnchorMap>; pastry: React.MutableRefObject<Partial<Record<MeshName, Object3D>>>; camera: React.MutableRefObject<Camera | null>; ready: React.MutableRefObject<ReadyStore> };
