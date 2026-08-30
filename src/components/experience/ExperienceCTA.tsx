"use client";
import {experienceConfig} from "./content/experienceConfig";
export function ExperienceCTA(){
 const {cta}=experienceConfig;
 const share=async()=>{if(navigator.share){await navigator.share({title:"ماسة",text:"اكتشف حكاية ماسة طبقةً بعد طبقة.",url:location.href})}else{await navigator.clipboard?.writeText(location.href)}};
 return <section className="experience-cta" aria-label="دعوة للتفاعل">
  <small>بعد الحكاية</small><h2>{cta.title}</h2><p>{cta.body}</p>
  <div className="cta-actions"><a href={cta.socialUrl} target="_blank" rel="noreferrer">{cta.socialLabel}</a><button type="button" onClick={share}>{cta.shareLabel}</button></div>
  <div className="discount"><span>{cta.discountLabel}</span><b dir="ltr">{cta.discountCode}</b></div>
 </section>
}
