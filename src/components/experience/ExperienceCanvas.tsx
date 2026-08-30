"use client";
import {ContactShadows,useGLTF} from "@react-three/drei";
import {Canvas,useFrame,useThree} from "@react-three/fiber";
import {Component,ReactNode,Suspense,useEffect,useRef} from "react";
import {DirectionalLight,MathUtils,PointLight,Vector3} from "three";
import {getInspectionIndex,inspections} from "./content/story";
import {mix,range,smooth} from "./controllers/math";
import {LOWER_ISOLATE,PISTACHIO_SOLO,PRE_ANATOMY,storyPose,UPPER_ISOLATE} from "./controllers/sceneTimeline";
import type {ExperienceBridge} from "./experienceTypes";
import {AnatomyBaklava} from "./models/AnatomyBaklava";
import {HeroBaklava} from "./models/HeroBaklava";
import {projectWorldToScreen} from "./three/projection";
const target=new Vector3(),selectedWorld=new Vector3();
class CanvasBoundary extends Component<{children:ReactNode;onError:()=>void},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return{failed:true}}componentDidCatch(){this.props.onError()}render(){return this.state.failed?null:this.props.children}}
function Director({bridge,keyLight,fillLight}:{bridge:ExperienceBridge;keyLight:React.RefObject<DirectionalLight|null>;fillLight:React.RefObject<PointLight|null>}){
 const {camera,size}=useThree();
 useFrame((_,delta)=>{const store=bridge.progress.current;store.current=MathUtils.damp(store.current,store.target,store.reduced?20:12,delta);const p=store.current,mobile=size.width<720,pose=storyPose(p,mobile),history=1-smooth(range(p,PRE_ANATOMY.start,PRE_ANATOMY.end)),anatomy=smooth(range(p,.425,.45)),micro=(smooth(range(p,UPPER_ISOLATE.start,UPPER_ISOLATE.end))*(1-smooth(range(p,PISTACHIO_SOLO.start-.01,PISTACHIO_SOLO.start))))+smooth(range(p,LOWER_ISOLATE.start,LOWER_ISOLATE.end)),index=getInspectionIndex(p);
  let cameraX=pose.x*.15*history,cameraY=.08+pose.y*.1*history,cameraZ=mix(mobile?4.9:4.5,mobile?5.35:5.05,anatomy)-Math.min(1,micro)*(mobile?.22:.38),targetX=pose.x*.22*history,targetY=pose.y*.16*history;
  if(index>=0){const object=bridge.anatomy.current[inspections[index].key];if(object){object.getWorldPosition(selectedWorld);targetY=MathUtils.clamp(selectedWorld.y*.12,-.18,.18)}}
  camera.position.x=MathUtils.damp(camera.position.x,cameraX,8,delta);camera.position.y=MathUtils.damp(camera.position.y,cameraY,8,delta);camera.position.z=MathUtils.damp(camera.position.z,cameraZ,8,delta);target.set(targetX,targetY,0);camera.lookAt(target);camera.updateMatrixWorld();bridge.camera.current=camera;
  if(index>=0){const item=inspections[index],object=bridge.anatomy.current[item.key];if(object)bridge.anchors.current[item.key]=projectWorldToScreen(object,camera,size.width,size.height)}
  const heat=smooth(range(p,.28,.32))*(1-smooth(range(p,.345,.37)));if(keyLight.current){keyLight.current.intensity=2.25+heat*.95+anatomy*.45;keyLight.current.color.set(heat>.15?"#f2aa62":anatomy?"#ead8bc":"#f5d7aa")}if(fillLight.current)fillLight.current.intensity=.7+heat*.45;
 });return null
}
export function ExperienceCanvas({bridge,heroReady,onHeroReady}:{bridge:ExperienceBridge;heroReady:boolean;onHeroReady:()=>void}){
 const pointer=useRef({x:0,y:0}),key=useRef<DirectionalLight>(null),fill=useRef<PointLight>(null);
 useEffect(()=>{if(heroReady)useGLTF.preload("/Media/baklavao.min.glb")},[heroReady]);
 return <div className="canvas-shell" onPointerMove={e=>{pointer.current.x=e.clientX/innerWidth*2-1;pointer.current.y=-(e.clientY/innerHeight*2-1)}}><Canvas shadows dpr={[1,1.35]} camera={{position:[0,.1,4.5],fov:34}} gl={{antialias:true,alpha:true,powerPreference:"high-performance"}}><ambientLight intensity={.34} color="#cbbba6"/><directionalLight ref={key} position={[3.5,4.5,4]} intensity={2.25} color="#f5d7aa" castShadow/><directionalLight position={[-3,1,-2]} intensity={.8} color="#899071"/><pointLight ref={fill} position={[0,-1.5,2]} intensity={.7} color="#9b552a"/><CanvasBoundary onError={()=>{bridge.ready.current.failed=true;onHeroReady()}}><Suspense fallback={null}><HeroBaklava bridge={bridge} pointer={pointer} onReady={onHeroReady}/></Suspense>{heroReady?<Suspense fallback={null}><AnatomyBaklava bridge={bridge}/></Suspense>:null}</CanvasBoundary><ContactShadows position={[0,-.95,0]} opacity={.16} scale={3.4} blur={3.2} far={2.2} frames={1}/><Director bridge={bridge} keyLight={key} fillLight={fill}/></Canvas></div>
}
