import type {MeshName} from "./story";
import {range,smooth} from "../controllers/math";

export type AnatomyKey=MeshName;
export type EnterDirection="right"|"left"|"bottom-right"|"bottom-left"|"top-right";
export type ExitDirection="left-up"|"right-up"|"left-down";
export type TextPlacement={x:string;y:string;align:"left"|"center"|"right";width:string;titleMaxWidth?:string};
export type AnatomyInspection={key:AnatomyKey;layers:readonly MeshName[];title:string;body:string;start:number;end:number;station:"left"|"right";mobilePlacement:TextPlacement;desktopPlacement:TextPlacement;mobileStoryOffset:readonly[number,number,number];enterDirection:EnterDirection;exitDirection:ExitDirection};

export const DISSECTION_STEPS:readonly AnatomyInspection[]=[
 {key:"TopShell",layers:["TopShell"],title:"القشرة العلوية",body:"السطح المخبوز المكشوف؛ يحمل جانبًا كبيرًا من التحمير المرئي، ويمنح أول كسر مقرمش عند قطع الحبة أو قضمها.",start:.69,end:.733,station:"right",mobilePlacement:{x:"50%",y:"49%",align:"center",width:"86%",titleMaxWidth:"10ch"},desktopPlacement:{x:"62%",y:"57%",align:"center",width:"42%"},mobileStoryOffset:[0,.04,0],enterDirection:"right",exitDirection:"left-up"},
 {key:"UpperFilo",layers:["UpperFilo"],title:"رقائق العجين العلوية",body:"رقائق شديدة الرقة تفصل القشرة المخبوزة عن قلب الفستق.",start:.719,end:.767,station:"left",mobilePlacement:{x:"50%",y:"66%",align:"center",width:"86%",titleMaxWidth:"11ch"},desktopPlacement:{x:"27%",y:"57%",align:"left",width:"38%"},mobileStoryOffset:[0,.16,.02],enterDirection:"left",exitDirection:"right-up"},
 {key:"Pistachio",layers:["Pistachio"],title:"قلب الفستق",body:"يبقى الفستق قريبًا من المنتصف، ليصنع التباين بين امتلاء المكسرات وهشاشة الرقائق المحيطة.",start:.753,end:.801,station:"right",mobilePlacement:{x:"50%",y:"68%",align:"center",width:"86%",titleMaxWidth:"9ch"},desktopPlacement:{x:"70%",y:"63%",align:"right",width:"40%"},mobileStoryOffset:[0,.12,.03],enterDirection:"bottom-right",exitDirection:"left-up"},
 {key:"LowerFilo",layers:["LowerFilo"],title:"رقائق العجين السفلية",body:"طبقات رقيقة وجافة تحمل القلب فوق القاعدة المخبوزة.",start:.787,end:.835,station:"left",mobilePlacement:{x:"50%",y:"66%",align:"center",width:"86%",titleMaxWidth:"10ch"},desktopPlacement:{x:"30%",y:"51%",align:"left",width:"38%"},mobileStoryOffset:[0,.34,.02],enterDirection:"bottom-left",exitDirection:"right-up"},
 {key:"BaseShell",layers:["BaseShell"],title:"القاعدة",body:"الجزء المخبوز الذي يغلق بناء الحبة من الأسفل، ويمنح اللقمة طبقتها الأخيرة من القرمشة.",start:.821,end:.869,station:"right",mobilePlacement:{x:"50%",y:"40%",align:"center",width:"86%",titleMaxWidth:"8ch"},desktopPlacement:{x:"58%",y:"35%",align:"center",width:"40%"},mobileStoryOffset:[0,-.12,.02],enterDirection:"top-right",exitDirection:"left-down"},
];
export const anatomyInspections=DISSECTION_STEPS;
const VISIBILITY_BOUNDARIES=[.69,.726,.76,.795,.83,.869] as const;
export const TEXT_EMPTY_GAP=.005;

export function getActiveDissectionStepIndex(progress:number){
 for(let index=0;index<DISSECTION_STEPS.length;index++)if(progress>=VISIBILITY_BOUNDARIES[index]&&progress<VISIBILITY_BOUNDARIES[index+1])return index;
 return -1;
}
export function getDissectionTextFrame(progress:number){
 const index=getActiveDissectionStepIndex(progress);
 if(index<0)return{index:-1,opacity:0,phase:"empty" as const,offset:1};
 const start=VISIBILITY_BOUNDARIES[index],end=VISIBILITY_BOUNDARIES[index+1],gap=TEXT_EMPTY_GAP/2,enterEnd=start+gap+.008,exitStart=end-gap-.006;
 if(progress<start+gap)return{index,opacity:0,phase:"enter" as const,offset:1};
 if(progress<enterEnd){const opacity=smooth(range(progress,start+gap,enterEnd));return{index,opacity,phase:"enter" as const,offset:1-opacity}}
 if(progress<exitStart)return{index,opacity:1,phase:"hold" as const,offset:0};
 if(progress<end-gap){const offset=smooth(range(progress,exitStart,end-gap));return{index,opacity:1-offset,phase:"exit" as const,offset}}
 return{index,opacity:0,phase:"exit" as const,offset:1};
}
