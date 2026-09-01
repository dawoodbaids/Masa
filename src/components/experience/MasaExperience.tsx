"use client";
import dynamic from "next/dynamic";
import {useCallback,useEffect,useMemo,useRef,useState} from "react";
import {useProgress} from "@react-three/drei";
import type {ExperienceBridge} from "./experienceTypes";
import {ExperienceOverlay} from "./ExperienceOverlay";
import {useExperienceProgress} from "./controllers/useExperienceProgress";
import {experienceConfig} from "./content/experienceConfig";
import {ENVIRONMENT} from "./content/responsiveScenes";

function ModelLoader({hidden}:{hidden:boolean}){const progress=useProgress(s=>s.progress),shown=progress>0&&progress<100?Math.round(progress):null;return <div className={`model-loader ${hidden?"is-hidden":""}`} aria-live="polite" aria-hidden={hidden}><strong>ماسة</strong><span>تحميل الحبة…</span><i><b style={{transform:`scaleX(${shown===null?.24:shown/100})`}}/></i>{shown===null?null:<small>{shown}%</small>}</div>}
const ExperienceCanvas=dynamic(()=>import("./ExperienceCanvas").then(m=>m.ExperienceCanvas),{ssr:false,loading:()=>null});
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const mix=(a:number,b:number,t:number)=>Math.round(a+(b-a)*t);
export function MasaExperience(){
 const track=useRef<HTMLElement>(null),stage=useRef<HTMLDivElement>(null),progress=useExperienceProgress(track);
 const anchors=useRef<ExperienceBridge["anchors"]["current"]>({}),pastry=useRef<ExperienceBridge["pastry"]["current"]>({}),camera=useRef<ExperienceBridge["camera"]["current"]>(null),ready=useRef<ExperienceBridge["ready"]["current"]>({pastry:false,failed:false});
 const [pastryReady,setPastryReady]=useState(false),[failed,setFailed]=useState(false),bridge=useMemo<ExperienceBridge>(()=>({progress,anchors,pastry,camera,ready}),[progress]);
 const reveal=useCallback(()=>{if(ready.current.pastry)return;ready.current.pastry=true;progress.current.locked=false;setPastryReady(true)},[progress]);
 const handleFailure=useCallback(()=>{ready.current.failed=true;setFailed(true)},[]);
 useEffect(()=>{let frame=0;const darkIntro=[20,15,11],ivory=ENVIRONMENT.intro,sand=ENVIRONMENT.transition,espresso=ENVIRONMENT.inside;const paint=()=>{const p=progress.current.current,introLight=clamp((p-.018)/.075),toSand=clamp((p-.455)/.065),toDark=clamp((p-.5)/.09),toFinal=clamp((p-.92)/.075);let bg=darkIntro.map((v,i)=>mix(v,ivory[i],introLight));bg=bg.map((v,i)=>mix(v,sand[i],toSand));bg=bg.map((v,i)=>mix(v,espresso[i],toDark));bg=bg.map((v,i)=>mix(v,ivory[i],toFinal));const lightInk=[246,238,224],darkInk=ENVIRONMENT.ink,cream=ENVIRONMENT.cream;let ink=lightInk.map((v,i)=>mix(v,darkInk[i],introLight));ink=ink.map((v,i)=>mix(v,cream[i],toDark));ink=ink.map((v,i)=>mix(v,darkInk[i],toFinal));if(stage.current){stage.current.style.setProperty("--stage-bg",`rgb(${bg[0]} ${bg[1]} ${bg[2]})`);stage.current.style.setProperty("--stage-ink",`rgb(${ink[0]} ${ink[1]} ${ink[2]})`);stage.current.style.setProperty("--intro-light",String(introLight));stage.current.style.setProperty("--heat",String(clamp((p-.34)/.04)*(1-clamp((p-.4)/.04))));stage.current.style.setProperty("--syrup",String(clamp((p-.405)/.035)*(1-clamp((p-.455)/.03))))}frame=requestAnimationFrame(paint)};frame=requestAnimationFrame(paint);return()=>cancelAnimationFrame(frame)},[progress]);
 return <main ref={track} className={`experience-track ${pastryReady?"is-ready":"is-loading"}`} aria-label="ماسة — رحلة داخل حبة البقلاوة"><div ref={stage} className="experience-sticky"><ExperienceCanvas bridge={bridge} onPastryReady={reveal} onFailure={handleFailure}/><ExperienceOverlay bridge={bridge} ready={pastryReady}/>{failed?<div className="model-fallback" dir="rtl"><strong>تعذر تحميل المجسم</strong><button type="button" onClick={()=>location.reload()}>إعادة المحاولة</button></div>:<ModelLoader hidden={pastryReady}/>}<noscript><section className="nojs-fallback" dir="rtl"><strong>ماسة</strong><p>حبة بقلاوة تحمل بين طبقاتها حكاية من الحرفة والوقت.</p><a href={experienceConfig.contact.url}>{experienceConfig.contact.label}</a></section></noscript></div></main>
}
