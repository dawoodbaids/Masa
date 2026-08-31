import {MathUtils} from "three";
import {range,smooth} from "./math";
export const PRE_ANATOMY={start:.512,end:.56};export const COMPLETE_PAUSE={start:.56,end:.58};export const EXPLOSION={start:.58,end:.68};export const INSPECTION={start:.69,end:.86};export const BEAUTY={start:.86,end:.89};export const RECONSTRUCTION={start:.89,end:.96};export const FINALE={start:.96,end:1};
export type RootPose={x:number;y:number;z:number;scale:number;rotationX:number;rotationY:number;rotationZ:number};
const poses:readonly RootPose[]=[
 {x:-.18,y:.18,z:-1.05,scale:.66,rotationX:.2,rotationY:-.72,rotationZ:-.1},{x:.08,y:.42,z:.16,scale:.74,rotationX:.1,rotationY:-.3,rotationZ:.035},{x:1.02,y:.48,z:.13,scale:.64,rotationX:.04,rotationY:.3,rotationZ:-.055},
 {x:-1.02,y:.1,z:-.12,scale:.66,rotationX:.13,rotationY:-.38,rotationZ:.065},{x:.92,y:.2,z:.12,scale:.7,rotationX:.02,rotationY:.34,rotationZ:-.045},{x:-.96,y:-.1,z:-.1,scale:.65,rotationX:.14,rotationY:-.27,rotationZ:.05},
 {x:.72,y:-.28,z:.15,scale:.78,rotationX:.07,rotationY:.2,rotationZ:-.035},{x:-.45,y:-.32,z:-.13,scale:.72,rotationX:.14,rotationY:-.16,rotationZ:.03},{x:0,y:-.1,z:-.24,scale:.7,rotationX:.12,rotationY:-.24,rotationZ:0},
];
const at=(index:number)=>poses[MathUtils.clamp(index,0,poses.length-1)];
const catmull=(a:number,b:number,c:number,d:number,t:number)=>{const t2=t*t,t3=t2*t;return .5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t2+(-a+3*b-3*c+d)*t3)};
export function sampleStoryPose(progress:number,mobile:boolean,out:RootPose){
 if(progress>=PRE_ANATOMY.end){const f=smooth(range(progress,FINALE.start,1));out.x=(mobile?.08:.24)*f;out.y=(mobile?-.04:-.1)+(mobile?.17:.14)*f;out.z=-.18+.22*f;out.scale=(mobile?.76:.7)+(mobile?.04:.07)*f;out.rotationX=.12-.035*f;out.rotationY=-.24+.09*f;out.rotationZ=.025*f;return out}
 const raw=range(progress,0,PRE_ANATOMY.end)*(poses.length-1),i=Math.min(poses.length-2,Math.floor(raw)),t=smooth(raw-i),a=at(i-1),b=at(i),c=at(i+1),d=at(i+2),m=mobile?.7:1;
 out.x=catmull(a.x,b.x,c.x,d.x,t)*m;out.y=catmull(a.y,b.y,c.y,d.y,t)*(mobile?.78:1);out.z=catmull(a.z,b.z,c.z,d.z,t)*(mobile?.68:1);out.scale=catmull(a.scale,b.scale,c.scale,d.scale,t)*(mobile?1.08:1);out.rotationX=catmull(a.rotationX,b.rotationX,c.rotationX,d.rotationX,t)*(mobile?.78:1);out.rotationY=catmull(a.rotationY,b.rotationY,c.rotationY,d.rotationY,t)*m;out.rotationZ=catmull(a.rotationZ,b.rotationZ,c.rotationZ,d.rotationZ,t)*m;return out;
}
export const createRootPose=():RootPose=>({x:0,y:0,z:0,scale:1,rotationX:0,rotationY:0,rotationZ:0});
