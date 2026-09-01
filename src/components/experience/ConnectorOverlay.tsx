"use client";
import {useEffect,useRef} from "react";
import {MathUtils} from "three";
import {anatomyInspectionLocal,anatomyInspections,getAnatomyInspectionIndex} from "./content/anatomy";
import {range,smooth} from "./controllers/math";
import type {AnchorPoint,ExperienceBridge} from "./experienceTypes";

const copy=[
 {n:"01 ◇",title:"القشرة",body:"أول قرمشة."},
 {n:"02 ◇",title:"الرقائق العلوية",body:"فوق قلب الفستق."},
 {n:"03 — القلب",title:"الفستق",body:"في منتصف كل شيء."},
 {n:"04 ◇",title:"الرقائق السفلية",body:"تحت قلب الفستق."},
 {n:"05 ◇",title:"القاعدة",body:"ما يحمل الحبة."},
];

export function ConnectorOverlay({bridge}:{bridge:ExperienceBridge}){
 const root=useRef<HTMLDivElement>(null);
 useEffect(()=>{const el=root.current;if(!el)return;const paths=Array.from(el.querySelectorAll<SVGPathElement>("path.connector-path")),marks=Array.from(el.querySelectorAll<SVGCircleElement>("circle.end-mark")),article=el.querySelector<HTMLElement>("article")!,debug=el.querySelector<HTMLElement>(".anatomy-debug"),debugAnchor=el.querySelector<HTMLElement>(".debug-anchor"),debugLabel=el.querySelector<HTMLElement>(".debug-label"),debugName=el.querySelector<HTMLElement>(".debug-name");let raf=0;
  const debugging=process.env.NODE_ENV==="development"&&new URLSearchParams(location.search).get("anatomyDebug")==="1";el.classList.toggle("is-debugging",debugging);
  const draw=()=>{const p=bridge.progress.current.current,index=getAnatomyInspectionIndex(p),local=anatomyInspectionLocal(p),show=index<0?0:smooth(range(local,.04,.2))*(1-smooth(range(local,.82,.98))),mobile=innerWidth<721;article.style.setProperty("--show",String(show));
   if(index<0){paths.forEach(x=>x.style.opacity="0");marks.forEach(x=>x.style.opacity="0");if(debug)debug.style.opacity="0";raf=requestAnimationFrame(draw);return}
   const item=anatomyInspections[index],text=copy[index],allAnchors=item.layers.map(x=>bridge.anchors.current[x]).filter((x):x is AnchorPoint=>!!x),anchors=mobile?allAnchors.slice(0,1):allAnchors,rootRect=el.getBoundingClientRect(),mobileSide=mobile?` mobile-${item.station}`:"";article.className=`anatomy-copy ${item.station}${index===2?" heart-copy":""}${mobile?" mobile-follow":""}${mobileSide}`;article.querySelector("b")!.textContent=text.n;article.querySelector("h2")!.textContent=text.title;article.querySelector("p")!.textContent=text.body;
   if(mobile&&anchors[0]){const zones=[.2,.34,.49,.64,.78],safeTop=Math.max(76,innerHeight*.09),safeBottom=Math.max(74,innerHeight*.1),anchorY=anchors[0].y-rootRect.top,zone=innerHeight*zones[index],labelCenter=MathUtils.lerp(zone,MathUtils.clamp(anchorY,safeTop,innerHeight-safeBottom),.28);article.style.top=`${MathUtils.clamp(labelCenter,safeTop,innerHeight-safeBottom)}px`}else article.style.removeProperty("top");
   const box=article.getBoundingClientRect(),labelLeft=box.left-rootRect.left,labelRight=box.right-rootRect.left,anchorLocalX=anchors[0]?anchors[0].x-rootRect.left:labelLeft,originX=mobile?(Math.abs(anchorLocalX-labelLeft)<=Math.abs(anchorLocalX-labelRight)?labelLeft:labelRight):(item.station==="right"?labelLeft:labelRight),originY=box.top-rootRect.top+box.height*.48;
   anchors.forEach((a,i)=>{const path=paths[i],mark=marks[i],ax=a.x-rootRect.left,ay=a.y-rootRect.top,control=MathUtils.clamp(Math.abs(originX-ax)*.22,16,38);if(mobile){const direction=originX<ax?-1:1,bendX=ax+direction*MathUtils.clamp(Math.abs(originX-ax)*.34,18,42);path.setAttribute("d",`M ${ax} ${ay} L ${bendX} ${ay} L ${bendX} ${originY} L ${originX} ${originY}`)}else path.setAttribute("d",`M ${ax} ${ay} C ${ax+control} ${ay}, ${originX-control} ${originY}, ${originX} ${originY}`);path.style.opacity=String(show);path.style.strokeDashoffset=String(1-show);mark.setAttribute("cx",String(ax));mark.setAttribute("cy",String(ay));mark.style.opacity=String(show)});
   for(let i=anchors.length;i<paths.length;i++){paths[i].style.opacity="0";marks[i].style.opacity="0"}
   if(debug&&debugAnchor&&debugLabel&&debugName&&anchors[0]){const a=anchors[0];debug.style.opacity="1";debugAnchor.style.transform=`translate(${a.x-rootRect.left}px,${a.y-rootRect.top}px)`;debugLabel.style.transform=`translate(${originX}px,${originY}px)`;debugName.textContent=`${a.name??item.key} · anchor ${Math.round(a.x)},${Math.round(a.y)} · center ${Math.round(a.cx??a.x)},${Math.round(a.cy??a.y)}`}
   if(debugName&&anchors[0]){const a=anchors[0];debugName.style.left=`${a.x-rootRect.left+9}px`;debugName.style.top=`${a.y-rootRect.top-16}px`;debugName.style.bottom="auto"}
   raf=requestAnimationFrame(draw)};
  raf=requestAnimationFrame(draw);return()=>cancelAnimationFrame(raf)},[bridge]);
 return <div ref={root} className="connector-overlay"><svg aria-hidden="true"><path className="connector-path" pathLength="1"/><path className="connector-path" pathLength="1"/><circle className="end-mark" r="3"/><circle className="end-mark" r="3"/></svg><article className="anatomy-copy"><b/><h2/><p/><small/></article>{process.env.NODE_ENV==="development"&&<div className="anatomy-debug"><i className="debug-safe"/><i className="debug-anchor"/><i className="debug-label"/><code className="debug-name"/></div>}</div>
}
