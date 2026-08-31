import {range,smooth} from "./math";

export const TIMELINE={heroEntry:[0,.075],productDiscovery:[.075,.17],storyMovement:[.17,.49],preOpen:[.49,.58],shellOpening:[.58,.625],internalReveal:[.615,.675],fullAnatomy:[.675,.69],topShellFocus:[.69,.73],filoFocus:[.73,.775],pistachioFocus:[.775,.815],baseFocus:[.815,.855],anatomyOverview:[.855,.89],internalReassembly:[.89,.93],shellClosing:[.93,.96],finalHero:[.96,1]} as const;
export const PRE_ANATOMY={start:.512,end:.56};export const COMPLETE_PAUSE={start:.56,end:.58};export const EXPLOSION={start:.58,end:.675};export const INSPECTION={start:.69,end:.855};export const BEAUTY={start:.855,end:.89};export const RECONSTRUCTION={start:.89,end:.96};export const FINALE={start:.96,end:1};
export type RootPose={x:number;y:number;z:number;scale:number;rotationX:number;rotationY:number;rotationZ:number};
type PoseKnot=RootPose&{progress:number};
const knots:readonly PoseKnot[]=[
 {progress:0,x:-.16,y:.12,z:-1.02,scale:.68,rotationX:.18,rotationY:-.58,rotationZ:-.075},
 {progress:.075,x:.1,y:.3,z:.08,scale:.75,rotationX:.1,rotationY:-.25,rotationZ:.025},
 {progress:.17,x:.7,y:.27,z:-.14,scale:.7,rotationX:.065,rotationY:.16,rotationZ:-.035},
 {progress:.29,x:-.68,y:.06,z:.09,scale:.72,rotationX:.12,rotationY:-.27,rotationZ:.04},
 {progress:.41,x:.46,y:-.13,z:-.16,scale:.74,rotationX:.075,rotationY:.13,rotationZ:-.025},
 {progress:.49,x:-.22,y:-.08,z:.02,scale:.72,rotationX:.11,rotationY:-.14,rotationZ:.018},
 {progress:.56,x:0,y:-.075,z:-.2,scale:.72,rotationX:.105,rotationY:-.2,rotationZ:0},
];
const at=(index:number)=>knots[Math.min(knots.length-1,Math.max(0,index))];
const catmull=(a:number,b:number,c:number,d:number,t:number)=>{const t2=t*t,t3=t2*t;return .5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t2+(-a+3*b-3*c+d)*t3)};
const sample=(a:PoseKnot,b:PoseKnot,c:PoseKnot,d:PoseKnot,t:number,mobile:boolean,out:RootPose)=>{const horizontal=mobile?.72:1,vertical=mobile?.82:1,depth=mobile?.7:1,rotation=mobile?.72:1;out.x=catmull(a.x,b.x,c.x,d.x,t)*horizontal;out.y=catmull(a.y,b.y,c.y,d.y,t)*vertical;out.z=catmull(a.z,b.z,c.z,d.z,t)*depth;out.scale=catmull(a.scale,b.scale,c.scale,d.scale,t)*(mobile?1.07:1);out.rotationX=catmull(a.rotationX,b.rotationX,c.rotationX,d.rotationX,t)*(mobile?.82:1);out.rotationY=catmull(a.rotationY,b.rotationY,c.rotationY,d.rotationY,t)*rotation;out.rotationZ=catmull(a.rotationZ,b.rotationZ,c.rotationZ,d.rotationZ,t)*rotation;return out};
export function sampleStoryPose(progress:number,mobile:boolean,out:RootPose){
 if(progress>=PRE_ANATOMY.end){const finale=smooth(range(progress,FINALE.start,1));out.x=(mobile?.055:.2)*finale;out.y=(mobile?-.055:-.075)+(mobile?.11:.12)*finale;out.z=-.2+.2*finale;out.scale=(mobile?.77:.72)+(mobile?.035:.055)*finale;out.rotationX=.105-.03*finale;out.rotationY=-.2+.085*finale;out.rotationZ=.018*finale;return out}
 let index=0;while(index<knots.length-2&&progress>knots[index+1].progress)index++;const b=at(index),c=at(index+1),local=smooth(range(progress,b.progress,c.progress));return sample(at(index-1),b,c,at(index+2),local,mobile,out);
}
export const createRootPose=():RootPose=>({x:0,y:0,z:0,scale:1,rotationX:0,rotationY:0,rotationZ:0});