import {SCENES,viewportMode} from "../content/responsiveScenes";
import {range,smooth} from "./math";
export const TIMELINE={heroEntry:[0,.075],productDiscovery:[.075,.17],storyMovement:[.17,.49],preOpen:[.49,.58],shellOpening:[.58,.625],internalReveal:[.615,.675],fullAnatomy:[.675,.69],topShellFocus:[.69,.73],filoFocus:[.73,.775],pistachioFocus:[.775,.815],baseFocus:[.815,.855],anatomyOverview:[.855,.89],internalReassembly:[.89,.93],shellClosing:[.93,.96],finalHero:[.96,1]} as const;
export const PRE_ANATOMY={start:.512,end:.56};export const COMPLETE_PAUSE={start:.56,end:.58};export const EXPLOSION={start:.58,end:.675};export const INSPECTION={start:.69,end:.855};export const BEAUTY={start:.855,end:.89};export const RECONSTRUCTION={start:.89,end:.96};export const FINALE={start:.96,end:1};
export type RootPose={x:number;y:number;z:number;scale:number;rotationX:number;rotationY:number;rotationZ:number};type Knot=RootPose&{progress:number};
const K:readonly Knot[]=[
 {progress:0,x:-.18,y:.12,z:-.5,scale:.70,rotationX:.18,rotationY:-.82,rotationZ:-.03},{progress:.055,x:.02,y:.15,z:-.28,scale:.76,rotationX:.11,rotationY:-.48,rotationZ:-.01},{progress:.115,x:.42,y:.26,z:.02,scale:.72,rotationX:.07,rotationY:.32,rotationZ:.02},{progress:.18,x:.58,y:.18,z:.1,scale:.70,rotationX:.08,rotationY:.72,rotationZ:-.03},{progress:.25,x:-.42,y:.38,z:-.24,scale:.74,rotationX:.48,rotationY:.02,rotationZ:.01},{progress:.325,x:-.56,y:.12,z:.08,scale:.73,rotationX:.08,rotationY:-.74,rotationZ:0},{progress:.40,x:.38,y:.28,z:-.12,scale:.76,rotationX:.28,rotationY:.5,rotationZ:-.02},{progress:.47,x:-.18,y:.02,z:.22,scale:.79,rotationX:.10,rotationY:-.94,rotationZ:0},{progress:.525,x:.24,y:.10,z:.28,scale:.81,rotationX:.14,rotationY:1.1,rotationZ:-.02},{progress:.56,x:0,y:-.075,z:-.2,scale:.72,rotationX:.105,rotationY:-.2,rotationZ:0}
];
const at=(i:number)=>K[Math.min(K.length-1,Math.max(0,i))];
const cat=(a:number,b:number,c:number,d:number,t:number)=>.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);
export function sampleStoryPose(p:number,viewport:number|boolean,out:RootPose){
 const width=typeof viewport==="number"?viewport:(typeof window!=="undefined"?window.innerWidth:(viewport?390:1200));
 const mode=viewportMode(width),v=SCENES[mode],mobile=mode==="mobile";
 if(p>=PRE_ANATOMY.end){const f=smooth(range(p,FINALE.start,1)),anatomyScale=mode==="mobile"?1.08:mode==="tablet"?1.05:1;out.x=(mobile?.055:.2)*f;out.y=(mobile?-.055:-.075)+(mobile?.11:.12)*f;out.z=-.2+.2*f;out.scale=((mobile?.77:.72)+(mobile?.035:.055)*f)*anatomyScale;out.rotationX=.105-.03*f;out.rotationY=-.2+.085*f;out.rotationZ=.018*f;return out}
 let i=0;while(i<K.length-2&&p>K[i+1].progress)i++;const b=at(i),c=at(i+1),t=smooth(range(p,b.progress,c.progress)),a=at(i-1),d=at(i+2);
 out.x=cat(a.x,b.x,c.x,d.x,t)*v.horizontal;out.y=cat(a.y,b.y,c.y,d.y,t)*v.vertical;out.z=cat(a.z,b.z,c.z,d.z,t)*v.depth;out.scale=cat(a.scale,b.scale,c.scale,d.scale,t)*v.scale;out.rotationX=cat(a.rotationX,b.rotationX,c.rotationX,d.rotationX,t)*v.rotation;out.rotationY=cat(a.rotationY,b.rotationY,c.rotationY,d.rotationY,t)*v.rotation;out.rotationZ=cat(a.rotationZ,b.rotationZ,c.rotationZ,d.rotationZ,t)*v.rotation;return out;
}
export const createRootPose=():RootPose=>({x:0,y:0,z:0,scale:1,rotationX:0,rotationY:0,rotationZ:0});
