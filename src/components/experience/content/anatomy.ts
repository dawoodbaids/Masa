import type {MeshName} from "./story";

export type AnatomyKey=MeshName|"FiloLayers";
export type AnatomyInspection={key:AnatomyKey;layers:readonly MeshName[];title:string;body:string;start:number;end:number;station:"left"|"right"};

export const anatomyInspections:readonly AnatomyInspection[]=[
 {key:"TopShell",layers:["TopShell"],title:"القشرة العلوية",body:"السطح المخبوز المكشوف؛ يحمل جانبًا كبيرًا من التحمير المرئي، ويمنح أول كسر مقرمش عند قطع الحبة أو قضمها.",start:.69,end:.73,station:"left"},
 {key:"FiloLayers",layers:["UpperFilo","LowerFilo"],title:"رقائق العجين",body:"رقائق شديدة الرقة تحيط بقلب الفستق من الأعلى والأسفل، وتصنع معًا القوام الهش متعدد المستويات.",start:.73,end:.775,station:"left"},
 {key:"Pistachio",layers:["Pistachio"],title:"قلب الفستق",body:"يبقى الفستق قريبًا من المنتصف، ليصنع التباين بين امتلاء المكسرات وهشاشة الرقائق المحيطة.",start:.775,end:.815,station:"right"},
 {key:"BaseShell",layers:["BaseShell"],title:"القاعدة",body:"الجزء المخبوز الذي يغلق بناء الحبة من الأسفل، ويمنح اللقمة طبقتها الأخيرة من القرمشة.",start:.815,end:.855,station:"left"},
];

export function getAnatomyInspectionIndex(progress:number){return anatomyInspections.findIndex(item=>progress>=item.start&&progress<item.end)}
export function anatomyInspectionLocal(progress:number){const index=getAnatomyInspectionIndex(progress);return index<0?0:(progress-anatomyInspections[index].start)/(anatomyInspections[index].end-anatomyInspections[index].start)}

