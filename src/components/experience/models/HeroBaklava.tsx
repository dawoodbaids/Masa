"use client";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Box3, Group, Material, Mesh, Object3D, Vector3 } from "three";
import { SkeletonUtils } from "three/examples/jsm/Addons.js";
import { heroOpacity, storyPose } from "../controllers/sceneTimeline";
import type { ExperienceBridge } from "../experienceTypes";
const MODEL_SCALE = 1.18;
function prepare(source: Object3D) {
  const scene = SkeletonUtils.clone(source);
  scene.traverse((child) => { if (!(child instanceof Mesh)) return; child.castShadow = true; child.receiveShadow = true; const array = Array.isArray(child.material); const materials = array ? child.material : [child.material]; const cloned = materials.map((m: Material) => { const c = m.clone(); c.transparent = true; return c; }); child.material = array ? cloned : cloned[0]; });
  const box = new Box3().setFromObject(scene); const size = box.getSize(new Vector3()); const center = box.getCenter(new Vector3()); const scale = MODEL_SCALE / Math.max(size.x, size.y, size.z); scene.scale.setScalar(scale); scene.position.copy(center).multiplyScalar(-scale); return scene;
}
export function HeroBaklava({ bridge, pointer, onReady }: { bridge: ExperienceBridge; pointer: React.MutableRefObject<{ x: number; y: number }>; onReady: () => void }) {
  const gltf = useGLTF("/Media/baklavaHero.glb"); const model = useMemo(() => prepare(gltf.scene), [gltf.scene]); const root = useRef<Group>(null); const signaled = useRef(false); const { gl, camera, scene } = useThree();
  useEffect(() => { onReady(); }, [onReady]);
  useEffect(() => { let active = true; const rendered = () => { if (active && !signaled.current) { signaled.current = true; requestAnimationFrame(onReady); } }; model.traverse((o) => { if (o instanceof Mesh) o.onAfterRender = rendered; }); gl.compileAsync(scene, camera).catch(() => undefined); return () => { active = false; model.traverse((o) => { if (o instanceof Mesh) { o.onAfterRender = () => undefined; (Array.isArray(o.material) ? o.material : [o.material]).forEach((m: Material) => m.dispose()); } }); }; }, [camera, gl, model, onReady, scene]);
  useFrame((state, delta) => { const group = root.current; if (!group) return; const p = bridge.progress.current.current; const pose = storyPose(p, state.size.width < 720); const reduced = bridge.progress.current.reduced; const opacity = heroOpacity(p, bridge.ready.current.anatomy); const finale = p > .962 ? (p - .962) / .038 : 0; const px = reduced ? 0 : pointer.current.x; const py = reduced ? 0 : pointer.current.y; const x = pose.x * (1 - finale); group.position.x += (x - group.position.x) * Math.min(1, delta * 4); group.position.y += ((pose.y + Math.sin(state.clock.elapsedTime * .55) * (reduced ? .008 : .022)) - group.position.y) * Math.min(1, delta * 4); group.rotation.y += ((pose.rotationY + px * .035) - group.rotation.y) * Math.min(1, delta * 3); group.rotation.x += ((.055 + py * .022) - group.rotation.x) * Math.min(1, delta * 3); group.scale.setScalar(pose.scale * (1 - finale * .02)); model.traverse((o) => { if (o instanceof Mesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { m.opacity = opacity; m.depthWrite = opacity > .55; }); }); group.visible = opacity > .002; });
  return <group ref={root}><primitive object={model} /></group>;
}
useGLTF.preload("/Media/baklavaHero.glb");
