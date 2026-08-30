import {mix,range,smooth} from "./math";
export const PRE_ANATOMY={start:.385,end:.425};
export const HANDOFF_IN={start:.425,end:.438};
export const MACRO_EXPLOSION={start:.445,end:.525};
export const MACRO_INSPECTION={start:.53,end:.625};
export const UPPER_ISOLATE={start:.635,end:.65};
export const UPPER_EXPLOSION={start:.65,end:.675};
export const UPPER_INSPECTION={start:.675,end:.75};
export const PISTACHIO_SOLO={start:.755,end:.79};
export const LOWER_ISOLATE={start:.795,end:.81};
export const LOWER_EXPLOSION={start:.81,end:.835};
export const LOWER_INSPECTION={start:.835,end:.91};
export const GROUP_RETURN={start:.91,end:.932};
export const BEAUTY={start:.932,end:.948};
export const RECONSTRUCTION={start:.948,end:.982};
export const HANDOFF_OUT={start:.982,end:.989};
const handoffIn=(p:number)=>smooth(range(p,HANDOFF_IN.start,HANDOFF_IN.end));
const handoffOut=(p:number)=>smooth(range(p,HANDOFF_OUT.start,HANDOFF_OUT.end));
export function heroOpacity(p:number,ready:boolean){if(!ready)return 1;return 1-handoffIn(p)+handoffOut(p)}
export function anatomyOpacity(p:number,ready:boolean){return ready?handoffIn(p)*(1-handoffOut(p)):0}
export type Pose={x:number;y:number;z:number;scale:number;rotationX:number;rotationY:number};
const desktop:Pose[]=[
 {x:0,y:.48,z:0,scale:.7,rotationX:.04,rotationY:-.12},
 {x:-1.05,y:.72,z:.08,scale:.58,rotationX:.02,rotationY:-.32},
 {x:.96,y:.47,z:-.08,scale:.68,rotationX:.07,rotationY:.26},
 {x:1.14,y:.08,z:.02,scale:.62,rotationX:.03,rotationY:.34},
 {x:-1.08,y:.2,z:.1,scale:.57,rotationX:.08,rotationY:-.27},
 {x:.94,y:-.08,z:-.16,scale:.78,rotationX:.1,rotationY:.2},
 {x:-.88,y:-.3,z:-.22,scale:.84,rotationX:.12,rotationY:-.18},
 {x:.78,y:-.5,z:-.08,scale:.73,rotationX:.08,rotationY:.16},
 {x:0,y:-.82,z:0,scale:.72,rotationX:.055,rotationY:0},
];
const mobilePoses:Pose[]=desktop.map((v,i)=>({...v,x:v.x*.48,y:mix(v.y,.28-i*.095,.62),scale:v.scale*.82,rotationY:v.rotationY*.65}));
export function storyPose(p:number,mobile:boolean){
 const poses=mobile?mobilePoses:desktop;if(p>=PRE_ANATOMY.end)return{x:0,y:mobile?-.16:-.12,z:0,scale:mobile?.62:.74,rotationX:.055,rotationY:0};
 const t=range(p,0,PRE_ANATOMY.end)*(poses.length-1),i=Math.min(poses.length-2,Math.floor(t)),f=smooth(t-i),a=poses[i],b=poses[i+1];
 return{x:mix(a.x,b.x,f),y:mix(a.y,b.y,f),z:mix(a.z,b.z,f),scale:mix(a.scale,b.scale,f),rotationX:mix(a.rotationX,b.rotationX,f),rotationY:mix(a.rotationY,b.rotationY,f)};
}
