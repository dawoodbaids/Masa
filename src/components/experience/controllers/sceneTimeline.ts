import {mix,range,smooth} from "./math";
export const PRE_ANATOMY={start:.512,end:.56};
export const COMPLETE_PAUSE={start:.56,end:.58};
export const EXPLOSION={start:.58,end:.68};
export const INSPECTION={start:.69,end:.86};
export const BEAUTY={start:.86,end:.89};
export const RECONSTRUCTION={start:.89,end:.96};
export const FINALE={start:.96,end:1};
export type Pose={x:number;y:number;z:number;scale:number;rotationX:number;rotationY:number};
const desktop:Pose[]=[
 {x:0,y:.42,z:0,scale:.72,rotationX:.12,rotationY:-.34},{x:1.03,y:.5,z:.05,scale:.61,rotationX:.09,rotationY:.28},
 {x:-1.05,y:.08,z:.08,scale:.63,rotationX:.08,rotationY:-.3},{x:.98,y:.22,z:-.06,scale:.69,rotationX:.04,rotationY:.32},
 {x:-1.08,y:-.12,z:.06,scale:.62,rotationX:.09,rotationY:-.24},{x:.9,y:-.34,z:-.12,scale:.8,rotationX:.11,rotationY:.18},
 {x:-.74,y:-.48,z:-.06,scale:.75,rotationX:.07,rotationY:-.14},{x:0,y:-.22,z:0,scale:.73,rotationX:.055,rotationY:0},
];
const mobile=desktop.map((pose,index)=>({...pose,x:pose.x*.42,y:mix(pose.y,.28-index*.07,.55),scale:pose.scale*.78,rotationY:pose.rotationY*.6}));
export function storyPose(p:number,isMobile:boolean){
 if(p>=PRE_ANATOMY.end){const finale=smooth(range(p,FINALE.start,1));return{x:mix(0,isMobile?.12:.28,finale),y:mix(isMobile?-.05:-.12,isMobile?.18:.04,finale),z:0,scale:mix(isMobile?.53:.69,isMobile?.58:.76,finale),rotationX:.09,rotationY:mix(-.24,-.18,finale)}}
 const poses=isMobile?mobile:desktop,t=range(p,0,PRE_ANATOMY.end)*(poses.length-1),index=Math.min(poses.length-2,Math.floor(t)),f=smooth(t-index),a=poses[index],b=poses[index+1];
 return{x:mix(a.x,b.x,f),y:mix(a.y,b.y,f),z:mix(a.z,b.z,f),scale:mix(a.scale,b.scale,f),rotationX:mix(a.rotationX,b.rotationX,f),rotationY:mix(a.rotationY,b.rotationY,f)};
}
