"use client";
import {useEffect,useRef} from "react";
import {MathUtils} from "three";
import {anatomyInspections,getAnatomyInspectionIndex} from "./content/anatomy";
import {range,smooth} from "./controllers/math";
import {MODE_CONFIG,useResponsiveBreakpoint} from "./content/deviceConfig";
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
 const {mode}=useResponsiveBreakpoint();
 const modeRef=useRef(mode);
 const dirty=useRef(true);
 useEffect(()=>{modeRef.current=mode;dirty.current=true},[mode]);
 useEffect(()=>{const el=root.current;if(!el)return;const paths=Array.from(el.querySelectorAll<SVGPathElement>("path.connector-path")),marks=Array.from(el.querySelectorAll<SVGCircleElement>("circle.end-mark")),article=el.querySelector<HTMLElement>("article")!,debug=el.querySelector<HTMLElement>(".anatomy-debug"),debugAnchor=el.querySelector<HTMLElement>(".debug-anchor"),debugLabel=el.querySelector<HTMLElement>(".debug-label"),debugName=el.querySelector<HTMLElement>(".debug-name");let raf=0,lastIndex=-2,lastStation="";
  const stableAnchors:AnchorPoint[]=[];
  let stableSide:"left"|"right"="right",anchorCount=0,resample=false;
  const debugging=process.env.NODE_ENV==="development"&&new URLSearchParams(location.search).get("anatomyDebug")==="1";el.classList.toggle("is-debugging",debugging);
  // Stable container measurements. Refreshed only by meaningful resize/orientation
  // events, so address-bar jitter never moves the connector geometry.
  let W=el.clientWidth,H=el.clientHeight,rootRect=el.getBoundingClientRect(),needsLayout=true;
  const markResize=()=>{const w=el.clientWidth,h=el.clientHeight;if(w!==W||h!==H||dirty.current){W=w;H=h;rootRect=el.getBoundingClientRect();needsLayout=true;dirty.current=false;resample=true}};
  addEventListener("resize",markResize,{passive:true});
  addEventListener("orientationchange",markResize,{passive:true});
  const ro=new ResizeObserver(markResize);ro.observe(el);
  const layout=(p:number,index:number)=>{
   needsLayout=false;
   if(index<0){stableAnchors.length=0;lastIndex=-2;lastStation="";anchorCount=0;paths.forEach(x=>x.style.opacity="0");marks.forEach(x=>x.style.opacity="0");if(debug)debug.style.opacity="0";return}
   const mobile=modeRef.current==="mobile",cfg=MODE_CONFIG[modeRef.current],item=anatomyInspections[index],text=copy[index],allAnchors=item.layers.map(x=>bridge.anchors.current[x]).filter((x):x is AnchorPoint=>!!x);
   if(allAnchors.length){if(lastIndex!==index||resample){stableAnchors.length=0;allAnchors.forEach(anchor=>stableAnchors.push({...anchor}));resample=false}if(mobile){const anchor=stableAnchors[0],margin=MathUtils.clamp(W*cfg.connector.marginOf,12,18),labelWidth=MathUtils.clamp(W*cfg.connector.labelWidthOf,108,118),leftGap=anchor.x-(rootRect.left+margin+labelWidth),rightGap=(W-margin-labelWidth)-(anchor.x-rootRect.left);stableSide=rightGap>leftGap?"right":"left"}}
   const anchors=stableAnchors.length?stableAnchors:allAnchors,station=mobile?stableSide:item.station,mobileSide=mobile?` mobile-${station}`:"";anchorCount=anchors.length;
   if(lastIndex!==index||lastStation!==station){lastIndex=index;lastStation=station;article.className=`anatomy-copy ${station}${index===2?" heart-copy":""}${mobile?" mobile-follow":""}${mobileSide}`;article.querySelector("b")!.textContent=text.n;article.querySelector("h2")!.textContent=text.title;article.querySelector("p")!.textContent=text.body}
   if(mobile&&anchors[0]){const zones=[.2,.34,.49,.64,.78],safeTop=Math.max(76,H*.09),safeBottom=Math.max(74,H*.1),anchorY=anchors[0].y-rootRect.top,zone=H*zones[index],labelCenter=MathUtils.lerp(zone,MathUtils.clamp(anchorY,safeTop,H-safeBottom),.28);article.style.top=`${MathUtils.clamp(labelCenter,safeTop,H-safeBottom)}px`}else article.style.removeProperty("top");
   const box=article.getBoundingClientRect(),labelLeft=box.left-rootRect.left,labelRight=box.right-rootRect.left,anchorLocalX=anchors[0]?anchors[0].x-rootRect.left:labelLeft,originX=mobile?(Math.abs(anchorLocalX-labelLeft)<=Math.abs(anchorLocalX-labelRight)?labelLeft:labelRight):(item.station==="right"?labelLeft:labelRight),originY=box.top-rootRect.top+box.height*.48;
   anchors.forEach((a,i)=>{const path=paths[i],mark=marks[i],ax=a.x-rootRect.left,ay=a.y-rootRect.top,control=MathUtils.clamp(Math.abs(originX-ax)*.22,16,38);if(mobile){const direction=originX<ax?-1:1,bendX=ax+direction*MathUtils.clamp(Math.abs(originX-ax)*.34,18,42);path.setAttribute("d",`M ${ax} ${ay} L ${bendX} ${ay} L ${bendX} ${originY} L ${originX} ${originY}`)}else path.setAttribute("d",`M ${ax} ${ay} C ${ax+control} ${ay}, ${originX-control} ${originY}, ${originX} ${originY}`);mark.setAttribute("cx",String(ax));mark.setAttribute("cy",String(ay))});
   for(let i=anchors.length;i<paths.length;i++){paths[i].style.opacity="0";marks[i].style.opacity="0"}
   if(debug&&debugAnchor&&debugLabel&&debugName&&anchors[0]){const a=anchors[0];debug.style.opacity="1";debugAnchor.style.transform=`translate(${a.x-rootRect.left}px,${a.y-rootRect.top}px)`;debugLabel.style.transform=`translate(${originX}px,${originY}px)`;debugName.textContent=`${a.name??item.key} · anchor ${Math.round(a.x)},${Math.round(a.y)} · center ${Math.round(a.cx??a.x)},${Math.round(a.cy??a.y)}`}
   if(debugName&&anchors[0]){const a=anchors[0];debugName.style.left=`${a.x-rootRect.left+9}px`;debugName.style.top=`${a.y-rootRect.top-16}px`;debugName.style.bottom="auto"}
  };
  const draw=()=>{const p=bridge.progress.current.current,rawIndex=getAnatomyInspectionIndex(p);let index=rawIndex;if(lastIndex>=0&&rawIndex!==lastIndex){const previous=anatomyInspections[lastIndex];if(p>=previous.start-.006&&p<=previous.end+.006)index=lastIndex}if(needsLayout||index!==lastIndex)layout(p,index);
   if(index<0){paths.forEach(x=>x.style.opacity="0");marks.forEach(x=>x.style.opacity="0");if(debug)debug.style.opacity="0";raf=requestAnimationFrame(draw);return}
   const local=index<0?0:(p-anatomyInspections[index].start)/(anatomyInspections[index].end-anatomyInspections[index].start),show=smooth(range(local,.04,.2))*(1-smooth(range(local,.82,.98)));article.style.setProperty("--show",String(show));for(let i=0;i<anchorCount&&i<paths.length;i++){paths[i].style.opacity=String(show);paths[i].style.strokeDashoffset=String(1-show);marks[i].style.opacity=String(show)}for(let i=anchorCount;i<paths.length;i++){paths[i].style.opacity="0";marks[i].style.opacity="0"}raf=requestAnimationFrame(draw)};
  raf=requestAnimationFrame(draw);return()=>{cancelAnimationFrame(raf);ro.disconnect();removeEventListener("resize",markResize);removeEventListener("orientationchange",markResize)}},[bridge]);
 return <div ref={root} className="connector-overlay"><svg aria-hidden="true"><path className="connector-path" pathLength="1"/><path className="connector-path" pathLength="1"/><circle className="end-mark" r="3"/><circle className="end-mark" r="3"/></svg><article className="anatomy-copy"><b/><h2/><p/><small/></article>{process.env.NODE_ENV==="development"&&<div className="anatomy-debug"><i className="debug-safe"/><i className="debug-anchor"/><i className="debug-label"/><code className="debug-name"/></div>}</div>
}