"use client";
import {useEffect,useRef} from "react";
import {anatomyInspectionLocal,anatomyInspections,getAnatomyInspectionIndex} from "./content/anatomy";
import {range,smooth} from "./controllers/math";
import type {ExperienceBridge,AnchorPoint} from "./experienceTypes";
const ARABIC_DIGITS=["\u0660","\u0661","\u0662","\u0663","\u0664","\u0665","\u0666","\u0667","\u0668","\u0669"] as const;const arabicNumber=(value:number)=>String(value).replace(/\d/g,d=>ARABIC_DIGITS[Number(d)]);
const clamp=(v:number,min:number,max:number)=>Math.min(max,Math.max(min,v));
export function ConnectorOverlay({bridge}:{bridge:ExperienceBridge}){
 const root=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const element=root.current,paths=Array.from(element?.querySelectorAll<SVGPathElement>("path")??[]),dots=Array.from(element?.querySelectorAll<SVGCircleElement>("circle")??[]),label=element?.querySelector<HTMLElement>("article");if(!element||paths.length===0||!label)return;
  let raf=0;
  const draw=()=>{
   const active=getAnatomyInspectionIndex(bridge.progress.current.current),local=anatomyInspectionLocal(bridge.progress.current.current),show=smooth(range(local,.04,.2))*(1-smooth(range(local,.8,.97)));
   if(active<0){paths.forEach(path=>path.setAttribute("opacity","0"));label.style.setProperty("--label-show","0");raf=requestAnimationFrame(draw);return}
   const item=anatomyInspections[active],mobile=innerWidth<720,anchors=item.layers.map(layer=>bridge.anchors.current[layer]).filter((p):p is AnchorPoint=>Boolean(p));
   label.querySelector("b")!.textContent=`${arabicNumber(active+1).padStart(2,"\u0660")} / \u0660\u0664`;label.querySelector("span")!.textContent=item.title;label.querySelector("small")!.textContent=item.body;
   label.style.setProperty("--label-show",String(show));
   const isRight=item.station==="right"&&!mobile;
   label.dataset.station=isRight?"right":"left";
   let cx=innerWidth*.5,cy=innerHeight*.5;
   if(anchors.length){cx=anchors.reduce((s,a)=>s+a.x,0)/anchors.length;cy=anchors.reduce((s,a)=>s+a.y,0)/anchors.length}
   let labelX,labelY;
   if(mobile){labelY=innerHeight*.68;labelX=cx}else{const box=Math.min(innerWidth*.32,440);labelY=innerHeight*.5;labelX=isRight?innerWidth-innerWidth*.07-box:innerWidth*.07+box}
    const lx=clamp(labelX,40,innerWidth-40);
    paths.forEach((path,i)=>{const a=anchors[i]??anchors[0];if(!a){path.setAttribute("opacity","0");return}const Lx=lx,Ly=labelY,dx=Lx-a.x,dy=Ly-a.y,len=Math.max(1,Math.hypot(dx,dy)),ux=dx/len,uy=dy/len,ex=a.x+ux*a.r*.92,ey=a.y+uy*a.r*.5;const stub=Math.min(56,len*.4),sx=ex+Math.sign(ux||(isRight?1:-1))*stub;path.setAttribute("d",`M ${ex.toFixed(1)} ${ey.toFixed(1)} L ${sx.toFixed(1)} ${ey.toFixed(1)} L ${Lx.toFixed(1)} ${Ly.toFixed(1)}`);path.setAttribute("opacity",String(show));path.style.strokeDashoffset=String(clamp(1-show,0,1));const dot=dots[i];if(dot){dot.setAttribute("cx",ex.toFixed(1));dot.setAttribute("cy",ey.toFixed(1));dot.setAttribute("opacity",String(show))}});for(let i=anchors.length;i<4;i++){const p=paths[i],d=dots[i];if(p)p.setAttribute("opacity","0");if(d)d.setAttribute("opacity","0")}
   raf=requestAnimationFrame(draw)
  };
  raf=requestAnimationFrame(draw);return()=>cancelAnimationFrame(raf)
 },[bridge]);
 return <div ref={root} className="connector-overlay"><svg aria-hidden="true"><path pathLength="1"/><path pathLength="1"/><path pathLength="1"/><path pathLength="1"/><circle r="2.4"/><circle r="2.4"/><circle r="2.4"/><circle r="2.4"/></svg><article className="anatomy-label"><b/><span/><small/></article></div>;
}
