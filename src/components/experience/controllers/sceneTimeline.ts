import {getResponsiveProfile} from "../content/responsiveScenes";
import {range,smooth} from "./math";
export const STORY_SCENES={
 hero:{start:0,revealEnd:.025,restStart:.105,end:.145},
 history:{start:.145,restStart:.245,end:.285},
 craft:{start:.285,restStart:.405,end:.44},
 preparation:{start:.44,end:.512},
 // Phase 2 inserts ovenEntry, baking, ovenExit, syrup and rest here.
 anatomy:{start:.512,end:.89},reassembly:{start:.89,end:.96},finale:{start:.96,end:1},
} as const;
export const TIMELINE={heroEntry:[0,.145],history:[.145,.285],craft:[.285,.44],preparation:[.44,.512],preOpen:[.512,.58],shellOpening:[.58,.595],internalReveal:[.58,.595],fullAnatomy:[.595,.69],topShellFocus:[.69,.73],filoFocus:[.73,.775],pistachioFocus:[.775,.815],baseFocus:[.815,.855],anatomyOverview:[.855,.89],internalReassembly:[.89,.905],shellClosing:[.89,.905],finalHero:[.96,1]} as const;
export const PRE_ANATOMY={start:.512,end:.56};export const COMPLETE_PAUSE={start:.56,end:.58};export const EXPLOSION={start:.58,end:.595};export const INSPECTION={start:.69,end:.855};export const BEAUTY={start:.855,end:.89};export const RECONSTRUCTION={start:.89,end:.905};export const FINALE={start:.96,end:1};
export type RootPose={x:number;y:number;z:number;scale:number;rotationX:number;rotationY:number;rotationZ:number};type Knot=RootPose&{progress:number};
const K:readonly Knot[]=[
 {progress:0,x:.10,y:.01,z:-.18,scale:.78,rotationX:.13,rotationY:-.46,rotationZ:-.015},
 {progress:.025,x:.10,y:.035,z:-.12,scale:.81,rotationX:.11,rotationY:-.36,rotationZ:-.01},
 {progress:.13,x:.09,y:.035,z:-.12,scale:.81,rotationX:.11,rotationY:-.32,rotationZ:-.01},
 {progress:.16,x:.07,y:.03,z:-.18,scale:.78,rotationX:.10,rotationY:-.28,rotationZ:-.008},
 {progress:.275,x:.07,y:.03,z:-.18,scale:.78,rotationX:.10,rotationY:-.22,rotationZ:-.008},
 {progress:.31,x:.055,y:.035,z:-.10,scale:.80,rotationX:.12,rotationY:.28,rotationZ:-.005},
 {progress:.405,x:.055,y:.035,z:-.10,scale:.80,rotationX:.12,rotationY:.43,rotationZ:-.005},
 {progress:.445,x:.03,y:.015,z:-.12,scale:.79,rotationX:.11,rotationY:.20,rotationZ:0},
 {progress:.51,x:.015,y:-.01,z:-.16,scale:.76,rotationX:.105,rotationY:-.08,rotationZ:0},
 {progress:.56,x:0,y:-.075,z:-.2,scale:.72,rotationX:.105,rotationY:-.2,rotationZ:0}
];
const at=(i:number)=>K[Math.min(K.length-1,Math.max(0,i))];
const cat=(a:number,b:number,c:number,d:number,t:number)=>.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);
export function sampleStoryPose(p:number,widthOrMobile:number|boolean,heightOrOut:number|RootPose,outMaybe?:RootPose){
 const width=typeof widthOrMobile==="number"?widthOrMobile:(typeof window!=="undefined"?window.innerWidth:(widthOrMobile?390:1200));
 const height=typeof heightOrOut==="number"?heightOrOut:(typeof window!=="undefined"?window.innerHeight:(widthOrMobile?844:800));
 const out=(typeof heightOrOut==="number"?outMaybe:heightOrOut) as RootPose;
 const v=getResponsiveProfile(width,height),mobile=v.mode==="mobile",mode=v.mode;
 if(p>=PRE_ANATOMY.end){const f=smooth(range(p,FINALE.start,1)),anatomyScale=mobile?v.scale/1.2:mode==="tablet"?1.05:1,finalY=mobile?(-.16+v.stageCenterY):mode==="tablet"?-.19:-.21;out.x=(mobile?.015:.08)*f;out.y=(mobile?v.anatomyCenterY:-.075)+(finalY-(mobile?v.anatomyCenterY:-.075))*f;out.z=-.2+.08*f;out.scale=((mobile?.72:.72)+(mobile?.015:.02)*f)*anatomyScale;out.rotationX=.105-.03*f;out.rotationY=-.2+.06*f;out.rotationZ=.012*f;return out}
 let i=0;while(i<K.length-2&&p>K[i+1].progress)i++;const b=at(i),c=at(i+1),t=smooth(range(p,b.progress,c.progress)),a=at(i-1),d=at(i+2);
 out.x=cat(a.x,b.x,c.x,d.x,t)*v.horizontal;out.y=cat(a.y,b.y,c.y,d.y,t)*v.vertical+(mobile?v.stageCenterY:0);out.z=cat(a.z,b.z,c.z,d.z,t)*v.depth;out.scale=cat(a.scale,b.scale,c.scale,d.scale,t)*v.scale;out.rotationX=cat(a.rotationX,b.rotationX,c.rotationX,d.rotationX,t)*v.rotation;out.rotationY=cat(a.rotationY,b.rotationY,c.rotationY,d.rotationY,t)*v.rotation;out.rotationZ=cat(a.rotationZ,b.rotationZ,c.rotationZ,d.rotationZ,t)*v.rotation;return out;
}
export const createRootPose=():RootPose=>({x:0,y:0,z:0,scale:1,rotationX:0,rotationY:0,rotationZ:0});
