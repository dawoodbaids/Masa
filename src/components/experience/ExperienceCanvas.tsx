"use client";
import {ContactShadows} from "@react-three/drei";
import {Canvas,useFrame,useThree} from "@react-three/fiber";
import {Component,ReactNode,useEffect,useRef} from "react";
import {Box3,Color,DirectionalLight,MathUtils,PointLight,Vector3} from "three";
import {getInspectionIndex,inspections} from "./content/story";
import {range,smooth} from "./controllers/math";
import {EXPLOSION,PRE_ANATOMY,RECONSTRUCTION,storyPose} from "./controllers/sceneTimeline";
import type {ExperienceBridge} from "./experienceTypes";
import {SingleBaklava} from "./models/SingleBaklava";
import {projectWorldToScreen} from "./three/projection";
const target=new Vector3(),selectedWorld=new Vector3(),bounds=new Box3();
const warmLight=new Color("#f1c078"),neutralLight=new Color("#ead1aa"),anatomyLight=new Color("#e2dacb"),heatLight=new Color("#f1a35d"),mixedLight=new Color();
const warmBackground=new Color("#0d0907"),neutralBackground=new Color("#0b0908"),anatomyBackground=new Color("#090a0a"),mixedBackground=new Color();
class CanvasBoundary extends Component<{children:ReactNode;onError:()=>void},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return{failed:true}}componentDidCatch(){this.props.onError()}render(){return this.state.failed?null:this.props.children}}
function Director({bridge,keyLight,fillLight}:{bridge:ExperienceBridge;keyLight:React.RefObject<DirectionalLight|null>;fillLight:React.RefObject<PointLight|null>}){
 const {camera,size,scene}=useThree();
 useFrame((_,delta)=>{const store=bridge.progress.current;store.current=MathUtils.damp(store.current,store.target,store.reduced?22:16,delta);const p=store.current,mobile=size.width<720,pose=storyPose(p,mobile),anatomy=smooth(range(p,PRE_ANATOMY.start,EXPLOSION.end)),index=getInspectionIndex(p);let cameraX=pose.x*.12,cameraY=.06+pose.y*.08,cameraZ=mobile?5.65:4.85,targetX=pose.x*.16,targetY=pose.y*.12;
  if(p>=PRE_ANATOMY.start&&p<RECONSTRUCTION.end){cameraX=0;cameraY=0;cameraZ=mobile?6.15:5.25;targetX=0;targetY=mobile?-.08:-.1}
  if(index>=0){const object=bridge.pastry.current[inspections[index].key];if(object){bounds.setFromObject(object).getCenter(selectedWorld);targetY=MathUtils.clamp(selectedWorld.y*.18,-.28,.28);cameraZ-=mobile?.25:.42}}
  camera.position.x=MathUtils.damp(camera.position.x,cameraX,9,delta);camera.position.y=MathUtils.damp(camera.position.y,cameraY,9,delta);camera.position.z=MathUtils.damp(camera.position.z,cameraZ,9,delta);target.set(targetX,targetY,0);camera.lookAt(target);camera.updateMatrixWorld();bridge.camera.current=camera;
  if(index>=0){const item=inspections[index],object=bridge.pastry.current[item.key];if(object){bounds.setFromObject(object).getCenter(selectedWorld);bridge.anchors.current[item.key]=projectWorldToScreen(selectedWorld,camera,size.width,size.height)}}
  const regional=smooth(range(p,.16,.25));mixedLight.copy(warmLight).lerp(neutralLight,regional).lerp(anatomyLight,anatomy);mixedBackground.copy(warmBackground).lerp(neutralBackground,regional).lerp(anatomyBackground,anatomy);scene.background=mixedBackground;const heat=smooth(range(p,.35,.39))*(1-smooth(range(p,.43,.47)));if(keyLight.current){keyLight.current.intensity=2.3+heat*.8+anatomy*.35;keyLight.current.color.copy(mixedLight).lerp(heatLight,heat)}if(fillLight.current)fillLight.current.intensity=.65+heat*.4;
 });return null;
}
export function ExperienceCanvas({bridge,onPastryReady}:{bridge:ExperienceBridge;onPastryReady:()=>void}){const pointer=useRef({x:0,y:0}),key=useRef<DirectionalLight>(null),fill=useRef<PointLight>(null);useEffect(()=>{if(process.env.NODE_ENV==="development")console.debug("[Masa] canvas mounted")},[]);return <div className="canvas-shell" onPointerMove={event=>{pointer.current.x=event.clientX/innerWidth*2-1;pointer.current.y=-(event.clientY/innerHeight*2-1)}}><Canvas shadows dpr={[1,1.35]} camera={{position:[0,.1,4.85],fov:34}} gl={{antialias:true,alpha:true,powerPreference:"high-performance"}}><ambientLight intensity={.34} color="#cbbba6"/><directionalLight ref={key} position={[3.5,4.5,4]} intensity={2.3} color="#f5d7aa" castShadow/><directionalLight position={[-3,1,-2]} intensity={.72} color="#858d76"/><pointLight ref={fill} position={[0,-1.5,2]} intensity={.65} color="#985027"/><CanvasBoundary onError={()=>{bridge.ready.current.failed=true;onPastryReady()}}><SingleBaklava bridge={bridge} pointer={pointer} onReady={onPastryReady}/></CanvasBoundary><ContactShadows position={[0,-1.25,0]} opacity={.13} scale={3.8} blur={3.4} far={2.4} frames={1}/><Director bridge={bridge} keyLight={key} fillLight={fill}/></Canvas></div>}
