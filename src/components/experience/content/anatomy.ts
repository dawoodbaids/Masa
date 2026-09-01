import type {MeshName} from "./story";

export type AnatomyKey=MeshName;
export type AnatomyInspection={key:AnatomyKey;layers:readonly MeshName[];title:string;body:string;start:number;end:number;station:"left"|"right"};

export const anatomyInspections:readonly AnatomyInspection[]=[
 {key:"TopShell",layers:["TopShell"],title:"القشرة العلوية",body:"السطح المخبوز المكشوف؛ يحمل جانبًا كبيرًا من التحمير المرئي، ويمنح أول كسر مقرمش عند قطع الحبة أو قضمها.",start:.69,end:.724,station:"right"},
 {key:"UpperFilo",layers:["UpperFilo"],title:"رقائق العجين العلوية",body:"رقائق شديدة الرقة تفصل القشرة المخبوزة عن قلب الفستق.",start:.726,end:.758,station:"left"},
 {key:"Pistachio",layers:["Pistachio"],title:"قلب الفستق",body:"يبقى الفستق قريبًا من المنتصف، ليصنع التباين بين امتلاء المكسرات وهشاشة الرقائق المحيطة.",start:.76,end:.794,station:"right"},
 {key:"LowerFilo",layers:["LowerFilo"],title:"رقائق العجين السفلية",body:"طبقات رقيقة وجافة تحمل القلب فوق القاعدة المخبوزة.",start:.796,end:.828,station:"left"},
 {key:"BaseShell",layers:["BaseShell"],title:"القاعدة",body:"الجزء المخبوز الذي يغلق بناء الحبة من الأسفل، ويمنح اللقمة طبقتها الأخيرة من القرمشة.",start:.83,end:.864,station:"right"},
];

export function getAnatomyInspectionIndex(progress:number){return anatomyInspections.findIndex(item=>progress>=item.start&&progress<item.end)}
export function anatomyInspectionLocal(progress:number){const index=getAnatomyInspectionIndex(progress);return index<0?0:(progress-anatomyInspections[index].start)/(anatomyInspections[index].end-anatomyInspections[index].start)}

