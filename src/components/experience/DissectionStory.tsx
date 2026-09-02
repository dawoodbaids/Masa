"use client";
import {useEffect,useRef} from "react";
import {DISSECTION_STEPS,getDissectionTextFrame,type EnterDirection,type ExitDirection} from "./content/anatomy";
import {useResponsiveBreakpoint} from "./content/deviceConfig";
import type {ExperienceBridge} from "./experienceTypes";

const motion=(enterDirection:EnterDirection,exitDirection:ExitDirection,phase:"empty"|"enter"|"hold"|"exit",amount:number,mobile:boolean)=>{
 const horizontal=mobile?32:52,diagonalX=mobile?28:44,vertical=mobile?20:30,exitX=mobile?24:40,exitY=mobile?8:12;
 const enter:Record<EnterDirection,[number,number]>={right:[horizontal,0],left:[-horizontal,0],"bottom-right":[diagonalX,vertical],"bottom-left":[-diagonalX,vertical],"top-right":[diagonalX,-vertical]};
 const exit:Record<ExitDirection,[number,number]>={"left-up":[-exitX,-exitY],"right-up":[exitX,-exitY],"left-down":[-exitX,exitY]};
 const vector=phase==="exit"?exit[exitDirection]:enter[enterDirection];
 return[vector[0]*amount,vector[1]*amount] as const;
};

export function DissectionStory({bridge}:{bridge:ExperienceBridge}){
 const article=useRef<HTMLElement>(null),number=useRef<HTMLElement>(null),title=useRef<HTMLHeadingElement>(null),body=useRef<HTMLParagraphElement>(null);
 const {isMobile}=useResponsiveBreakpoint();
 useEffect(()=>{const node=article.current;if(!node)return;let frame=0,currentIndex=-1;const draw=()=>{const state=getDissectionTextFrame(bridge.progress.current.current);if(state.index!==currentIndex){currentIndex=state.index;if(currentIndex>=0){const step=DISSECTION_STEPS[currentIndex],placement=isMobile?step.mobilePlacement:step.desktopPlacement;number.current!.textContent=String(currentIndex+1).padStart(2,"0");title.current!.textContent=step.title;body.current!.textContent=step.body;node.style.setProperty("--copy-x",placement.x);node.style.setProperty("--copy-y",placement.y);node.style.setProperty("--copy-width",placement.width);node.style.setProperty("--title-max",placement.titleMaxWidth??"100%");node.style.textAlign=placement.align}}if(currentIndex>=0){const step=DISSECTION_STEPS[currentIndex],[x,y]=motion(step.enterDirection,step.exitDirection,state.phase,state.offset,isMobile);node.style.setProperty("--copy-opacity",String(state.opacity));node.style.setProperty("--motion-x",`${x}px`);node.style.setProperty("--motion-y",`${y}px`)}else node.style.setProperty("--copy-opacity","0");frame=requestAnimationFrame(draw)};frame=requestAnimationFrame(draw);return()=>cancelAnimationFrame(frame)},[bridge,isMobile]);
 return <section className="dissection-story" dir="rtl" aria-label="طبقات البقلاوة"><article ref={article} className="dissection-copy" aria-live="polite"><b ref={number}/><h2 ref={title}/><p ref={body}/></article></section>;
}
