"use client";
import {useGLTF} from "@react-three/drei";
import {useFrame,useThree} from "@react-three/fiber";
import {useEffect,useMemo,useRef} from "react";
import {Box3,Group,Material,MathUtils,Mesh,Object3D,Vector3} from "three";
import {SkeletonUtils} from "three/examples/jsm/Addons.js";
import {heroOpacity,storyPose} from "../controllers/sceneTimeline";
import type {ExperienceBridge} from "../experienceTypes";
const MODEL_SCALE=1.18;
function prepare(source:Object3D){const scene=SkeletonUtils.clone(source);scene.traverse(child=>{if(!(child instanceof Mesh))return;child.castShadow=true;child.receiveShadow=true;const array=Array.isArray(child.material),materials=array?child.material:[child.material],cloned=materials.map((m:Material)=>{const c=m.clone();c.transparent=true;return c});child.material=array?cloned:cloned[0]});const box=new Box3().setFromObject(scene),size=box.getSize(new Vector3()),center=box.getCenter(new Vector3()),scale=MODEL_SCALE/Math.max(size.x,size.y,size.z);scene.scale.setScalar(scale);scene.position.copy(center).multiplyScalar(-scale);return scene}
export function HeroBaklava({bridge,pointer,onReady}:{bridge:ExperienceBridge;pointer:React.MutableRefObject<{x:number;y:number}>;onReady:()=>void}){
 const gltf=useGLTF("/Media/baklavaHero.min.glb"),model=useMemo(()=>prepare(gltf.scene),[gltf.scene]),meshes=useMemo(()=>{const list:Mesh[]=[];model.traverse(o=>{if(o instanceof Mesh)list.push(o)});return list},[model]),root=useRef<Group>(null),signaled=useRef(false),{gl,camera,scene}=useThree();
 const signal=()=>{if(!signaled.current){signaled.current=true;requestAnimationFrame(()=>requestAnimationFrame(onReady))}};
 useEffect(()=>{let active=true;meshes.forEach(mesh=>mesh.onAfterRender=()=>{if(active)signal()});gl.compileAsync(scene,camera).then(()=>{if(active)signal()}).catch(()=>undefined);return()=>{active=false;meshes.forEach(mesh=>{mesh.onAfterRender=()=>undefined;(Array.isArray(mesh.material)?mesh.material:[mesh.material]).forEach((m:Material)=>m.dispose())})}},[camera,gl,meshes,scene]);
 useFrame((state,delta)=>{const group=root.current;if(!group)return;signal();const p=bridge.progress.current.current,pose=storyPose(p,state.size.width<720),reduced=bridge.progress.current.reduced,opacity=heroOpacity(p,bridge.ready.current.anatomy),finale=MathUtils.clamp((p-.989)/.011,0,1),px=reduced?0:pointer.current.x,py=reduced?0:pointer.current.y,finalX=(state.size.width<720?.18:.28)*finale;group.position.x+=(pose.x+finalX-group.position.x)*Math.min(1,delta*7);group.position.y+=(pose.y+Math.sin(state.clock.elapsedTime*.55)*(reduced?.004:.014)-group.position.y)*Math.min(1,delta*7);group.position.z=pose.z;group.rotation.y+=(pose.rotationY+px*.025-group.rotation.y)*Math.min(1,delta*6);group.rotation.x+=(pose.rotationX+py*.015-group.rotation.x)*Math.min(1,delta*6);group.scale.setScalar(pose.scale*(1+finale*.04));meshes.forEach(mesh=>(Array.isArray(mesh.material)?mesh.material:[mesh.material]).forEach(m=>{m.opacity=opacity;m.depthWrite=opacity>.55}));group.visible=opacity>.002});
 return <group ref={root}><primitive object={model}/></group>
}
useGLTF.preload("/Media/baklavaHero.min.glb");
