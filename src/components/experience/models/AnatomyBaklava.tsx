"use client";
import {useGLTF} from "@react-three/drei";
import {useFrame,useThree} from "@react-three/fiber";
import {useEffect,useMemo,useRef} from "react";
import {Box3,Color,Group,Material,MathUtils,Mesh,MeshStandardMaterial,Quaternion,Vector3} from "three";
import {SkeletonUtils} from "three/examples/jsm/Addons.js";
import {expectedMeshes,getInspectionIndex,inspectionLocal,inspections,lowerFilo,MeshName,upperFilo} from "../content/story";
import {mix,range,smooth} from "../controllers/math";
import {anatomyOpacity,BEAUTY,GROUP_RETURN,LOWER_EXPLOSION,LOWER_INSPECTION,LOWER_ISOLATE,MACRO_EXPLOSION,PISTACHIO_SOLO,RECONSTRUCTION,storyPose,UPPER_EXPLOSION,UPPER_INSPECTION,UPPER_ISOLATE} from "../controllers/sceneTimeline";
import type {ExperienceBridge} from "../experienceTypes";
type Original={position:Vector3;quaternion:Quaternion;scale:Vector3;colors:Color[]};
const finalY:Record<MeshName,number>={TopShell:.72,UpperFilo1:.37,UpperFilo2:.355,UpperFilo3:.34,UpperFilo4:.325,UpperFilo5:.31,Pistachio:0,LowerFilo1:-.31,LowerFilo2:-.325,LowerFilo3:-.34,LowerFilo4:-.355,LowerFilo5:-.37,BaseShell:-.72};
function stagedExplosion(name:MeshName,p:number){
 if(name==="TopShell")return smooth(range(p,.445,.472));
 if(upperFilo.includes(name))return smooth(range(p,.458,.492));
 if(name==="Pistachio")return 1;
 if(lowerFilo.includes(name))return smooth(range(p,.478,.512));
 return smooth(range(p,.495,.525));
}
export function AnatomyBaklava({bridge}:{bridge:ExperienceBridge}){
 const gltf=useGLTF("/Media/baklavao.min.glb"),hero=useGLTF("/Media/baklavaHero.min.glb"),root=useRef<Group>(null),{gl,camera,scene:stage,size}=useThree();
 const prepared=useMemo(()=>{const scene=SkeletonUtils.clone(gltf.scene);scene.traverse(child=>{if(!(child instanceof Mesh))return;if(!expectedMeshes.includes(child.name as MeshName)){child.visible=false;return}const array=Array.isArray(child.material),source=array?child.material:[child.material],materials=source.map((m:Material)=>{const c=m.clone();c.transparent=true;return c});child.material=array?materials:materials[0];child.castShadow=true;child.receiveShadow=true;child.frustumCulled=false});
  expectedMeshes.forEach(name=>{const mesh=scene.getObjectByName(name) as Mesh|undefined,aligned=hero.scene.getObjectByName(name);if(!mesh||!aligned)throw new Error(`Masa anatomy mesh missing: ${name}`);mesh.position.copy(aligned.position);mesh.quaternion.copy(aligned.quaternion);mesh.scale.copy(aligned.scale)});
  scene.getObjectByName("Cube")?.removeFromParent();const box=new Box3().setFromObject(scene),extent=box.getSize(new Vector3()),center=box.getCenter(new Vector3()),normalizer=1.18/Math.max(extent.x,extent.y,extent.z);scene.scale.setScalar(normalizer);scene.position.copy(center).multiplyScalar(-normalizer);
  const meshes=new Map<MeshName,Mesh>(),originals=new Map<MeshName,Original>();expectedMeshes.forEach(name=>{const mesh=scene.getObjectByName(name) as Mesh;meshes.set(name,mesh);const mats=Array.isArray(mesh.material)?mesh.material:[mesh.material];originals.set(name,{position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),scale:mesh.scale.clone(),colors:mats.map(m=>m instanceof MeshStandardMaterial?m.color.clone():new Color(1,1,1))})});return{scene,meshes,originals}},[gltf.scene,hero.scene]);
 useEffect(()=>{const anchors:Partial<Record<MeshName,Mesh>>={};prepared.meshes.forEach((mesh,name)=>anchors[name]=mesh);bridge.anatomy.current=anchors;let active=true;const rendered=()=>{if(active)bridge.ready.current.anatomy=true};prepared.meshes.forEach(mesh=>mesh.onAfterRender=rendered);gl.compileAsync(stage,camera).catch(()=>undefined);return()=>{active=false;bridge.anatomy.current={};prepared.meshes.forEach(mesh=>{mesh.onAfterRender=()=>undefined;(Array.isArray(mesh.material)?mesh.material:[mesh.material]).forEach(m=>m.dispose())})}},[bridge,camera,gl,prepared,stage]);
 useFrame((_,delta)=>{const group=root.current;if(!group)return;const p=bridge.progress.current.current,opacity=anatomyOpacity(p,bridge.ready.current.anatomy),activeIndex=getInspectionIndex(p),inspection=activeIndex>=0?inspections[activeIndex]:null,local=inspectionLocal(p),focus=inspection?smooth(range(local,.06,.2))*(1-smooth(range(local,.8,.96))):0,upperOnly=p>=UPPER_ISOLATE.start&&p<PISTACHIO_SOLO.start,pistOnly=p>=PISTACHIO_SOLO.start&&p<LOWER_ISOLATE.start,lowerOnly=p>=LOWER_ISOLATE.start&&p<GROUP_RETURN.start,returning=p>=GROUP_RETURN.start&&p<BEAUTY.end,rebuilding=p>=RECONSTRUCTION.start;
  const upperIsolation=smooth(range(p,UPPER_ISOLATE.start,UPPER_ISOLATE.end)),upperSpread=smooth(range(p,UPPER_EXPLOSION.start,UPPER_EXPLOSION.end))*(1-smooth(range(p,UPPER_INSPECTION.end,PISTACHIO_SOLO.start))),lowerIsolation=smooth(range(p,LOWER_ISOLATE.start,LOWER_ISOLATE.end)),lowerSpread=smooth(range(p,LOWER_EXPLOSION.start,LOWER_EXPLOSION.end))*(1-smooth(range(p,LOWER_INSPECTION.end,GROUP_RETURN.start))),returned=smooth(range(p,GROUP_RETURN.start,GROUP_RETURN.end));
  prepared.meshes.forEach((mesh,name)=>{const original=prepared.originals.get(name)!;let y=finalY[name]*stagedExplosion(name,p),x=0,visibility=1,active=false;
   if(inspection?.phase==="macro"){active=inspection.key===name||(inspection.key==="UpperFilo3"&&upperFilo.includes(name))||(inspection.key==="LowerFilo3"&&lowerFilo.includes(name));visibility=active?1:.2;x=active?(inspection.station==="left"?.18:-.18)*focus:0}
   if(upperOnly){const index=upperFilo.indexOf(name);visibility=index>=0?1-upperSpread*.12:1-upperIsolation;if(index>=0)y=mix(finalY[name],(2-index)*.115,upperIsolation)*upperSpread;y+=active&&inspection?.phase==="upper"?.015:0;active=inspection?.phase==="upper"&&inspection.key===name;if(index>=0&&!active&&inspection?.phase==="upper")visibility=.18}
   if(pistOnly){visibility=name==="Pistachio"?1:0;active=name==="Pistachio";y=0;x=.12*focus}
   if(lowerOnly){const index=lowerFilo.indexOf(name);visibility=index>=0?1-lowerSpread*.12:1-lowerIsolation;if(index>=0)y=mix(finalY[name],(2-index)*.115,lowerIsolation)*lowerSpread;active=inspection?.phase==="lower"&&inspection.key===name;if(index>=0&&!active&&inspection?.phase==="lower")visibility=.18}
   if(returning){const index=lowerFilo.indexOf(name),from=index>=0?(2-index)*.115:0;y=mix(from,finalY[name],returned);visibility=index>=0?1:returned;active=false}
   if(rebuilding){let close=0;if(name==="BaseShell")close=smooth(range(p,.948,.96));else if(lowerFilo.includes(name))close=smooth(range(p,.955,.97));else if(name==="Pistachio")close=smooth(range(p,.963,.974));else if(upperFilo.includes(name))close=smooth(range(p,.968,.979));else close=smooth(range(p,.974,.982));y=finalY[name]*(1-close);visibility=1;active=false}
   mesh.position.copy(original.position);mesh.position.x+=x;mesh.position.y+=y;mesh.position.z+=active?focus*.05:0;mesh.quaternion.copy(original.quaternion);mesh.scale.copy(original.scale).multiplyScalar(active?1+focus*.025:1);
   const mats=Array.isArray(mesh.material)?mesh.material:[mesh.material];mats.forEach((material,i)=>{material.opacity=opacity*visibility;material.depthWrite=material.opacity>.7;if(material instanceof MeshStandardMaterial){material.color.copy(original.colors[i]).multiplyScalar(active?1.12:1);material.emissive.set(active&&name==="Pistachio"?"#273517":"#000000");material.emissiveIntensity=active?.075:0}});
  });
  const pose=storyPose(.43,size.width<720);group.position.x=MathUtils.damp(group.position.x,pose.x,9,delta);group.position.y=MathUtils.damp(group.position.y,pose.y,9,delta);group.rotation.y=MathUtils.damp(group.rotation.y,0,9,delta);group.rotation.x=MathUtils.damp(group.rotation.x,.055,9,delta);group.scale.setScalar(pose.scale);group.visible=bridge.ready.current.anatomy?opacity>.002:true;
 });return <group ref={root}><primitive object={prepared.scene}/></group>
}
