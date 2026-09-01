"use client";
import {Canvas,useFrame,useThree} from "@react-three/fiber";
import {Component,ReactNode,Suspense,useEffect,useRef} from "react";
import {Box3,Color,DirectionalLight,MathUtils,Mesh,PerspectiveCamera,PointLight,Vector3} from "three";
import {anatomyInspections,getAnatomyInspectionIndex} from "./content/anatomy";
import {CINEMATIC_CAMERA,SCENES,viewportMode} from "./content/responsiveScenes";
import {range,smooth} from "./controllers/math";
import {createRootPose,EXPLOSION,PRE_ANATOMY,RECONSTRUCTION,sampleStoryPose} from "./controllers/sceneTimeline";
import type {ExperienceBridge} from "./experienceTypes";
import {SingleBaklava} from "./models/SingleBaklava";
import {projectWorldToScreen} from "./three/projection";
const target=new Vector3(),selectedWorld=new Vector3(),bounds=new Box3(),anchorV=new Vector3();
const warmLight=new Color("#f1c078"),neutralLight=new Color("#ead1aa"),anatomyLight=new Color("#e2dacb"),heatLight=new Color("#f1a35d"),mixedLight=new Color();
class CanvasBoundary extends Component<{children:ReactNode;onError:()=>void},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return{failed:true}}componentDidCatch(){this.props.onError()}render(){return this.state.failed?null:this.props.children}}
function Director({bridge,keyLight,fillLight}:{bridge:ExperienceBridge;keyLight:React.RefObject<DirectionalLight|null>;fillLight:React.RefObject<PointLight|null>}){
 const {camera,size,scene,pointer}=useThree(),pose=useRef(createRootPose()),lastMode=useRef("");
 useFrame((state,delta)=>{
  const store=bridge.progress.current;store.current=MathUtils.damp(store.current,store.target,store.reduced?24:16,delta);
  store.velocity=MathUtils.damp(store.velocity,0,8,delta);
  const p=store.current,mode=viewportMode(size.width),profile=SCENES[mode],cinema=CINEMATIC_CAMERA[mode],mobile=mode==="mobile",rootPose=sampleStoryPose(p,size.width,pose.current),anatomy=smooth(range(p,PRE_ANATOMY.start,EXPLOSION.end)),index=getAnatomyInspectionIndex(p);
  if(lastMode.current!==mode&&camera instanceof PerspectiveCamera){lastMode.current=mode;camera.fov=mobile?37:mode==="tablet"?35:34;camera.near=.1;camera.far=100;camera.updateProjectionMatrix()}
  const hero=smooth(range(p,.015,.07))*(1-smooth(range(p,.11,.15))),craft=smooth(range(p,.14,.19))*(1-smooth(range(p,.25,.29))),heat=smooth(range(p,.29,.33))*(1-smooth(range(p,.355,.39))),syrup=smooth(range(p,.36,.395))*(1-smooth(range(p,.425,.455))),texture=smooth(range(p,.425,.45))*(1-smooth(range(p,.475,.495))),quiet=Math.abs(store.velocity)<.00035&&((p<.49)||(p>.965));
  const push=hero*cinema.heroPush+craft*cinema.craftPush+heat*cinema.heatPush+syrup*cinema.syrupPush+texture*cinema.texturePush;
  const idle=store.reduced?0:(quiet?Math.sin(state.clock.elapsedTime*.45)*cinema.idle:0),inertia=store.reduced?0:MathUtils.clamp(store.velocity*8,-.035,.035),pointerWeight=(p<.49||p>.96)?cinema.pointer:0;
  let cameraX=rootPose.x*(mobile?.07:.1)+pointer.x*pointerWeight+inertia,cameraY=.06+rootPose.y*(mobile?.045:.065)+pointer.y*pointerWeight*.55+idle,cameraZ=profile.cameraZ-rootPose.z*(mobile?.07:.1)-push,targetX=rootPose.x*(mobile?.1:.14)+pointer.x*pointerWeight*.35,targetY=rootPose.y*(mobile?.075:.1)+idle*.5;
  if(p>=PRE_ANATOMY.start&&p<RECONSTRUCTION.end){const fit=smooth(range(p,PRE_ANATOMY.start,EXPLOSION.end));cameraX=0;cameraY=mobile?-.02:0;cameraZ=profile.anatomyCameraZ+fit*(mobile?.32:.18);targetX=0;targetY=mobile?-.08:-.12}
  if(index>=0){const object=bridge.pastry.current[anatomyInspections[index].layers[0]];if(object instanceof Mesh){object.geometry.boundingBox??object.geometry.computeBoundingBox();if(object.geometry.boundingBox){bounds.copy(object.geometry.boundingBox).applyMatrix4(object.matrixWorld).getCenter(selectedWorld);targetY=MathUtils.clamp(selectedWorld.y*.18,-.28,.28);cameraZ-=mobile?.08:.18}}}
  camera.position.x=MathUtils.damp(camera.position.x,cameraX,9,delta);camera.position.y=MathUtils.damp(camera.position.y,cameraY,9,delta);camera.position.z=MathUtils.damp(camera.position.z,cameraZ,9,delta);target.set(targetX,targetY,0);camera.lookAt(target);camera.updateMatrixWorld();bridge.camera.current=camera;
  if(index>=0){const item=anatomyInspections[index];item.layers.forEach(layer=>{const object=bridge.pastry.current[layer];if(object instanceof Mesh&&object.geometry.boundingBox){bounds.copy(object.geometry.boundingBox).applyMatrix4(object.matrixWorld);bounds.getCenter(selectedWorld);const center=projectWorldToScreen(selectedWorld,camera,size.width,size.height);anchorV.set(bounds.max.x,bounds.max.y,bounds.max.z);const c1=projectWorldToScreen(anchorV,camera,size.width,size.height);anchorV.set(bounds.min.x,bounds.min.y,bounds.min.z);const c2=projectWorldToScreen(anchorV,camera,size.width,size.height);bridge.anchors.current[layer]={x:center.x,y:center.y,r:Math.max(Math.hypot(c1.x-center.x,c1.y-center.y),Math.hypot(c2.x-center.x,c2.y-center.y))}}})}
  const regional=smooth(range(p,.12,.25));mixedLight.copy(warmLight).lerp(neutralLight,regional).lerp(anatomyLight,anatomy);scene.background=null;if(keyLight.current){keyLight.current.intensity=2.3+heat*.9+syrup*.45+texture*.25+anatomy*.35;keyLight.current.color.copy(mixedLight).lerp(heatLight,heat*.9+syrup*.35);keyLight.current.position.x=3.5-syrup*2.4;keyLight.current.position.y=4.5-texture*.7}if(fillLight.current)fillLight.current.intensity=.65+heat*.42+syrup*.28;
 });return null;
}
export function ExperienceCanvas({bridge,onPastryReady,onFailure}:{bridge:ExperienceBridge;onPastryReady:()=>void;onFailure:()=>void}){const key=useRef<DirectionalLight>(null),fill=useRef<PointLight>(null);useEffect(()=>{if(process.env.NODE_ENV==="development")console.debug("[Masa] canvas mounted")},[]);return <div className="canvas-shell"><Canvas dpr={[1,1.35]} camera={{position:[0,.1,4.85],fov:34}} gl={{antialias:true,alpha:true,powerPreference:"high-performance"}}><ambientLight intensity={.4} color="#cbbba6"/><directionalLight ref={key} position={[3.5,4.5,4]} intensity={2.3} color="#f5d7aa"/><directionalLight position={[-3,1,-2]} intensity={.72} color="#858d76"/><pointLight ref={fill} position={[0,-1.5,2]} intensity={.65} color="#985027"/><CanvasBoundary onError={onFailure}><Suspense fallback={null}><SingleBaklava bridge={bridge} onReady={onPastryReady}/></Suspense></CanvasBoundary><Director bridge={bridge} keyLight={key} fillLight={fill}/></Canvas></div>}
