"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  Box3,
  Euler,
  Group,
  Material,
  MathUtils,
  Mesh,
  Quaternion,
  Vector3,
} from "three";
import { BAKLAVA_MODEL_URL } from "../modelAsset";
import {
  anatomyInspections,
  getActiveDissectionStepIndex,
} from "../content/anatomy";
import { expectedMeshes, MeshName } from "../content/story";
import { range, smooth } from "../controllers/math";
import {
  createRootPose,
  PRE_ANATOMY,
  RECONSTRUCTION,
  sampleStoryPose,
} from "../controllers/sceneTimeline";
import type { ExperienceBridge } from "../experienceTypes";
import { getResponsiveProfile } from "../content/responsiveScenes";
import { MODE_CONFIG } from "../content/deviceConfig";
import type { DeviceConfig } from "../content/deviceConfig";

type LogicalLayer = MeshName;
type Axis = "x" | "y" | "z";
type OriginalTransform = {
  position: Vector3;
  quaternion: Quaternion;
  scale: Vector3;
};
type MotionSpec = {
  c1: readonly [number, number, number];
  c2: readonly [number, number, number];
  to: readonly [number, number, number];
  rotation: readonly [number, number, number];
  focus: readonly [number, number, number];
  focusRotation: readonly [number, number, number];
};
type LayerRig = {
  logical: LogicalLayer;
  mesh: Mesh;
  motion: Group;
  footprint: Group;
  original: OriginalTransform;
  assembledSize: Vector3;
  anatomySize: Vector3;
  anatomyScale: Vector3;
  spec: MotionSpec;
  anatomyQuaternion: Quaternion;
  focusQuaternion: Quaternion;
  releaseOffset: Vector3;
  anatomyPosition: Vector3;
  materials: Material[];
};

export const LAYER_MAPPING: Readonly<Record<LogicalLayer, MeshName>> = {
  TopShell: "TopShell",
  UpperFilo: "LowerFilo",
  Pistachio: "Pistachio",
  LowerFilo: "UpperFilo",
  BaseShell: "BaseShell",
};
const LAYERS: readonly LogicalLayer[] = [
  "TopShell",
  "UpperFilo",
  "Pistachio",
  "LowerFilo",
  "BaseShell",
];
const MOTION: Readonly<Record<LogicalLayer, MotionSpec>> = {
  TopShell: {
    c1: [0.015, 0.15, 0.04],
    c2: [-0.055, 0.41, 0.1],
    to: [-0.08, 0.58, 0.14],
    rotation: [-0.15, 0.13, -0.075],
    focus: [-0.025, 0.025, 0.1],
    focusRotation: [-0.035, 0.045, 0.018],
  },
  UpperFilo: {
    c1: [-0.01, 0.034, -0.005],
    c2: [0.04, 0.2, -0.055],
    to: [0.07, 0.34, -0.08],
    rotation: [0.07, -0.1, 0.045],
    focus: [0.028, 0.014, 0.085],
    focusRotation: [0.022, -0.038, -0.012],
  },
  Pistachio: {
    c1: [0, 0.006, 0.018],
    c2: [-0.012, 0.02, 0.055],
    to: [-0.02, 0.02, 0.075],
    rotation: [-0.022, 0.045, 0.014],
    focus: [0.012, 0.006, 0.1],
    focusRotation: [-0.014, 0.04, 0.008],
  },
  LowerFilo: {
    c1: [0.01, -0.033, -0.005],
    c2: [-0.04, -0.2, -0.055],
    to: [-0.07, -0.34, -0.08],
    rotation: [-0.07, 0.1, -0.045],
    focus: [-0.028, -0.014, 0.085],
    focusRotation: [0.022, 0.038, 0.012],
  },
  BaseShell: {
    c1: [-0.015, -0.15, 0.035],
    c2: [0.055, -0.41, 0.095],
    to: [0.08, -0.58, 0.13],
    rotation: [0.15, -0.12, 0.075],
    focus: [0.025, -0.025, 0.1],
    focusRotation: [0.035, -0.04, -0.018],
  },
};
const identity = new Quaternion(),
  tempPosition = new Vector3();
const correction = (value: number) => MathUtils.clamp(value, 1, 1.42);
const COMPACT_FILO_OFFSET = 0.045;
// GLB bounds show X as width, Y as vertical, and Z as depth toward the camera.
// The former hero yaw was -0.46 rad; this compensating base yaw presents the
// textured pistachio face front-on while keeping scroll rotation relative.
// GLB bounds establish Y as up, X as width, and Z as the front/depth axis.
// The previous quarter-turn was the source of the closed/side-facing hero.
// This is the calibrated front-facing pose: a small pitch, no roll/yaw.
const BASE_ROTATION = Object.freeze({ x: -0.08, y: 0, z: 0 });
const TWO_PI = Math.PI * 2;
const TRANSITION_MIN_OPACITY = 0.22;
const PISTACHIO_ANATOMY_SCALE = Object.freeze({ x: 1.28, y: 1.18, z: 1.28 });
const cubic = (a: number, b: number, c: number, t: number) => {
  const u = 1 - t;
  return 3 * u * u * t * a + 3 * u * t * t * b + t * t * t * c;
};
// One clamped, progress-derived value drives every transform. Traversing the
// opening trigger backward therefore closes with the exact same curve/speed.
// The same narrow progress window is used in both directions. No transition
// state is retained, so every scroll position always produces the same pose.
const explodeProgress = (p: number, cfg: DeviceConfig) => {
  const openT = smooth(range(p, cfg.explode.start, cfg.explode.end));
  const value = p <= cfg.explode.reconstructStart
    ? openT
    : 1 - smooth(range(p, cfg.explode.reconstructStart, cfg.explode.reconstructEnd));
  if (value < cfg.explode.snapClosed) return 0;
  if (value > cfg.explode.snapOpen) return 1;
  return value;
};
const equalsVector = (a: Vector3, b: Vector3) => a.distanceToSquared(b) < 1e-12;
const equalsQuaternion = (a: Quaternion, b: Quaternion) =>
  Math.abs(a.dot(b)) > 1 - 1e-10;

export function SingleBaklava({
  bridge,
  onReady,
}: {
  bridge: ExperienceBridge;
  onReady: () => void;
}) {
  const gltf = useGLTF(BAKLAVA_MODEL_URL, false, true),
    root = useRef<Group>(null),
    orientationGroup = useRef<Group>(null),
    spinGroup = useRef<Group>(null),
    chapterGroup = useRef<Group>(null),
    validated = useRef(false),
    rootPose = useRef(createRootPose()),
autoSpinAngle = useRef(0),
    dissectionActive = useRef(false),
    dissectionTarget = useRef(0),
    dissectionBlend = useRef(1),
    { size } = useThree();
  const prepared = useMemo(() => {
    const scene = gltf.scene.clone(true),
      physical = new Map<MeshName, Mesh>();
    scene.traverse((child) => {
      if (!(child instanceof Mesh)) return;
      if (!expectedMeshes.includes(child.name as MeshName)) return;
      const array = Array.isArray(child.material),
        source = array ? child.material : [child.material],
        materials = source.map((material: Material) => {
          const clone = material.clone();
          clone.transparent = false;
          return clone;
        });
      child.material = array ? materials : materials[0];
      child.castShadow = true;
      child.receiveShadow = true;
      child.geometry.computeBoundingBox();
      physical.set(child.name as MeshName, child);
    });
    const missing = expectedMeshes.filter((name) => !physical.has(name));
    if (missing.length || physical.size !== 5)
      throw new Error(
        `Masa GLB mesh mismatch: ${missing.join(", ") || physical.size}`,
      );
    scene.updateMatrixWorld(true);
    const dimensions = new Map<MeshName, Vector3>();
    physical.forEach((mesh, name) =>
      dimensions.set(
        name,
        new Box3().setFromObject(mesh).getSize(new Vector3()),
      ),
    );
    const top = dimensions.get("TopShell")!,
      base = dimensions.get("BaseShell")!,
      shellAverage = new Vector3().addVectors(top, base).multiplyScalar(0.5),
      minimum = Math.min(shellAverage.x, shellAverage.y, shellAverage.z),
      verticalAxis: Axis =
        minimum === shellAverage.x
          ? "x"
          : minimum === shellAverage.z
            ? "z"
            : "y",
      rigs = new Map<LogicalLayer, LayerRig>();
    LAYERS.forEach((logical) => {
      const mesh = physical.get(LAYER_MAPPING[logical])!,
        parent = mesh.parent;
      if (!parent) throw new Error(`Masa mesh has no parent: ${mesh.name}`);
      const materials = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material],
        original = {
          position: mesh.position.clone(),
          quaternion: mesh.quaternion.clone(),
          scale: mesh.scale.clone(),
        },
        assembledSize = dimensions.get(LAYER_MAPPING[logical])!.clone(),
        anatomyScale = new Vector3(1, 1, 1),
        filo = logical === "UpperFilo" || logical === "LowerFilo";
      if (filo) {
        (["x", "y", "z"] as Axis[]).forEach((axis) => {
          if (axis !== verticalAxis)
            anatomyScale[axis] = correction(
              (shellAverage[axis] * 0.94) / assembledSize[axis],
            );
        });
      }
      const motion = new Group(),
        footprint = new Group();
      motion.name = `${logical}Motion`;
      footprint.name = `${logical}AnatomyFootprint`;
      parent.add(motion);
      motion.add(footprint);
      footprint.add(mesh);
      mesh.position.copy(original.position);
      mesh.quaternion.copy(original.quaternion);
      mesh.scale.copy(original.scale);
      const spec = MOTION[logical];
      rigs.set(logical, {
        logical,
        mesh,
        motion,
        footprint,
        original,
        assembledSize,
        anatomySize: assembledSize.clone().multiply(anatomyScale),
        anatomyScale,
        spec,
        anatomyQuaternion: new Quaternion().setFromEuler(
          new Euler(...spec.rotation),
        ),
        focusQuaternion: new Quaternion().setFromEuler(
          new Euler(...spec.focusRotation),
        ),
        releaseOffset: new Vector3(),
        anatomyPosition: new Vector3(),
        materials,
      });
    });
    const pistachioRig = rigs.get("Pistachio")!;
    pistachioRig.anatomyScale.set(
      PISTACHIO_ANATOMY_SCALE.x,
      PISTACHIO_ANATOMY_SCALE.y,
      PISTACHIO_ANATOMY_SCALE.z,
    );
    pistachioRig.anatomySize
      .copy(pistachioRig.assembledSize)
      .multiply(pistachioRig.anatomyScale);
    rigs.forEach((rig) => {
      const toX = rig.spec.to[0],
        toY = rig.spec.to[1],
        toZ = rig.spec.to[2],
        toAxis = verticalAxis === "x" ? toX : verticalAxis === "y" ? toY : toZ,
        direction = Math.sign(toAxis);
      rig.releaseOffset.set(0, 0, 0);
      if (rig.logical === "UpperFilo" || rig.logical === "LowerFilo")
        rig.releaseOffset[verticalAxis] = -direction * COMPACT_FILO_OFFSET;
      rig.anatomyPosition.set(toX, toY, toZ);
    });
    scene.updateMatrixWorld(true);
    const box = new Box3().setFromObject(scene),
      extent = box.getSize(new Vector3()),
      center = box.getCenter(new Vector3()),
      normalizer = 1.32 / Math.max(extent.x, extent.y, extent.z);
    scene.scale.setScalar(normalizer);
    scene.position.copy(center).multiplyScalar(-normalizer);
    return { scene, rigs, verticalAxis };
  }, [gltf.scene]);
  useEffect(() => {
    prepared.scene.updateMatrixWorld(true);
    if (process.env.NODE_ENV === "development") {
      console.group("Masa · logical layer mapping");
      LAYERS.forEach((logical) =>
        console.info(`${logical} -> ${LAYER_MAPPING[logical]}`),
      );
      console.groupEnd();
      console.group(
        `Masa · transforms and dimensions; ${prepared.verticalAxis.toUpperCase()} is vertical`,
      );
      prepared.rigs.forEach((rig) =>
        console.info(rig.logical, {
          meshName: rig.mesh.name,
          originalTransform: {
            position: rig.original.position.toArray(),
            quaternion: rig.original.quaternion.toArray(),
            scale: rig.original.scale.toArray(),
          },
          assembledTransform: {
            position: rig.mesh.position.toArray(),
            quaternion: rig.mesh.quaternion.toArray(),
            scale: rig.mesh.scale.toArray(),
          },
          anatomyTransform: {
            offset: rig.spec.to,
            rotation: rig.spec.rotation,
            scale: rig.anatomyScale.toArray(),
          },
          assembledDimensions: rig.assembledSize.toArray(),
          anatomyDimensions: rig.anatomySize.toArray(),
          closedEqualsOriginal:
            equalsVector(rig.mesh.position, rig.original.position) &&
            equalsQuaternion(rig.mesh.quaternion, rig.original.quaternion) &&
            equalsVector(rig.mesh.scale, rig.original.scale),
        }),
      );
      console.groupEnd();
      console.group("Masa · filo three states (RELEASE)");
      (["UpperFilo", "LowerFilo"] as LogicalLayer[]).forEach((logical) => {
        const rig = prepared.rigs.get(logical)!;
        console.info(`${logical} (${rig.mesh.name}):`, {
          ASSEMBLED_position: rig.original.position.toArray(),
          COMPACT_offset: rig.releaseOffset.toArray(),
          ANATOMY_position: rig.anatomyPosition.toArray(),
          ASSEMBLED_scale: rig.original.scale.toArray(),
          RELEASE_scale: rig.original.scale.toArray(),
          ANATOMY_scale: rig.anatomyScale.toArray(),
          compactOffsetAlong: prepared.verticalAxis,
        });
        console.assert(
          equalsVector(rig.original.scale, rig.original.scale),
          `${rig.logical}: ASSEMBLED scale must equal RELEASE scale`,
        );
      });
      console.groupEnd();
    }
    onReady();
    return () => {
      prepared.rigs.forEach((rig) =>
        (Array.isArray(rig.mesh.material)
          ? rig.mesh.material
          : [rig.mesh.material]
        ).forEach((material) => material.dispose()),
      );
    };
  }, [bridge, onReady, prepared]);
useFrame((_, delta) => {
    const group = root.current;
    if (!group) return;
    const profile = getResponsiveProfile(size.width, size.height),
      mode = profile.mode,
      mobile = mode === "mobile",
      cfg = MODE_CONFIG[mode],
      p = bridge.progress.current.current,
      pose = sampleStoryPose(p, size.width, size.height, rootPose.current),
      explosionAmount = explodeProgress(p, cfg),
      transitionOpacity = explosionAmount > 0 && explosionAmount < 1
        ? 1-(1-TRANSITION_MIN_OPACITY)*Math.sin(Math.PI*explosionAmount)
        : 1,
      activeStepIndex = getActiveDissectionStepIndex(p),
      // Central per-device model travel. Desktop keeps unit multipliers;
      // mobile layers its multipliers on the tuned viewport profile values.
      modelMotion = mobile
        ? {
            x: profile.explosion * cfg.model.explode.scale,
            y: profile.anatomySpacing * cfg.model.explode.y,
            z: cfg.model.explode.z,
          }
        : { x: cfg.model.explode.scale, y: cfg.model.explode.y, z: cfg.model.explode.z };
    group.position.set(pose.x, pose.y, pose.z);
    group.scale.setScalar(
      pose.scale,
    );
    // Mobile stops the turntable slightly earlier than the dissection beat so
    // it aligns to the readable front angle and is fully stable before the
    // explosion begins. Desktop keeps its existing alignment timing.
    const dissectionStop = PRE_ANATOMY.start + cfg.spin.stopOffset;
    const inDissection = p >= dissectionStop && p < RECONSTRUCTION.end;
    if (inDissection && !dissectionActive.current) {
      dissectionActive.current = true;
      dissectionTarget.current = Math.round(autoSpinAngle.current / TWO_PI) * TWO_PI;
      dissectionBlend.current = 0;
    } else if (!inDissection && dissectionActive.current) {
      dissectionActive.current = false;
      autoSpinAngle.current = dissectionTarget.current;
      dissectionBlend.current = 1;
    }
    if (orientationGroup.current) orientationGroup.current.rotation.set(BASE_ROTATION.x, BASE_ROTATION.y, BASE_ROTATION.z);
    if (inDissection && spinGroup.current) {
      const safeDelta = Math.min(Math.max(delta, 0), 0.05);
      dissectionBlend.current = Math.min(1, dissectionBlend.current + safeDelta / cfg.spin.alignSeconds);
      if (cfg.spin.hardLockAtExplode && mobile && p >= cfg.explode.start) {
        // Guarantee auto-spin and the explosion never overlap on mobile.
        autoSpinAngle.current = dissectionTarget.current;
        dissectionBlend.current = 1;
        spinGroup.current.rotation.y = dissectionTarget.current;
      } else {
        spinGroup.current.rotation.y = MathUtils.lerp(autoSpinAngle.current, dissectionTarget.current, smooth(dissectionBlend.current));
        if (dissectionBlend.current >= 1) autoSpinAngle.current = dissectionTarget.current;
      }
    } else if (!bridge.progress.current.reduced && spinGroup.current) {
      const safeDelta = Math.min(Math.max(delta, 0), 0.05);
      autoSpinAngle.current = (autoSpinAngle.current + safeDelta * (TWO_PI / cfg.spin.revolutionsSeconds)) % TWO_PI;
      spinGroup.current.rotation.y = autoSpinAngle.current;
    } else if (spinGroup.current) {
      autoSpinAngle.current = 0;
      spinGroup.current.rotation.y = 0;
    }
    if (chapterGroup.current) chapterGroup.current.rotation.set(0, 0, 0);
    prepared.rigs.forEach((rig) => {
      const isFilo = rig.logical === "UpperFilo" || rig.logical === "LowerFilo",
        stepIndex = anatomyInspections.findIndex(step=>step.layers.includes(rig.logical)),
        s = rig.spec,
        motionScale = modelMotion.x,
        mobileY = modelMotion.y,
        mobileZ = modelMotion.z;
      if (isFilo) {
        tempPosition.set(
          MathUtils.lerp(rig.releaseOffset.x, rig.anatomyPosition.x * motionScale, explosionAmount),
          MathUtils.lerp(rig.releaseOffset.y, rig.anatomyPosition.y * mobileY, explosionAmount),
          MathUtils.lerp(rig.releaseOffset.z, rig.anatomyPosition.z * mobileZ, explosionAmount),
        );
        rig.motion.quaternion.slerpQuaternions(
          identity,
          rig.anatomyQuaternion,
          explosionAmount,
        );
        rig.footprint.scale.set(
          MathUtils.lerp(1, rig.anatomyScale.x, explosionAmount),
          MathUtils.lerp(1, rig.anatomyScale.y, explosionAmount),
          MathUtils.lerp(1, rig.anatomyScale.z, explosionAmount),
        );
      } else {
        tempPosition.set(
          cubic(s.c1[0], s.c2[0], s.to[0], explosionAmount) * motionScale,
          cubic(s.c1[1], s.c2[1], s.to[1], explosionAmount) * mobileY,
          cubic(s.c1[2], s.c2[2], s.to[2], explosionAmount) * mobileZ,
        );
        rig.motion.quaternion.slerpQuaternions(
          identity,
          rig.anatomyQuaternion,
          explosionAmount,
        );
        rig.footprint.scale.set(
          MathUtils.lerp(1, rig.anatomyScale.x, explosionAmount),
          MathUtils.lerp(1, rig.anatomyScale.y, explosionAmount),
          MathUtils.lerp(1, rig.anatomyScale.z, explosionAmount),
        );
      }
      rig.motion.position.copy(tempPosition);
      if(mobile&&activeStepIndex===stepIndex){const offset=anatomyInspections[stepIndex].mobileStoryOffset;rig.motion.position.x+=offset[0];rig.motion.position.y+=offset[1];rig.motion.position.z+=offset[2]}
      rig.mesh.position.copy(rig.original.position);
      rig.mesh.quaternion.copy(rig.original.quaternion);
      rig.mesh.scale.copy(rig.original.scale);
      rig.mesh.visible = activeStepIndex < 0 || stepIndex === activeStepIndex;
      rig.materials.forEach((material) => {
        material.opacity = transitionOpacity;
        const transparent = material.opacity < .999;
        if (material.transparent !== transparent) {
          material.transparent = transparent;
          material.needsUpdate = true;
        }
        material.depthWrite = material.opacity > .98;
      });
    });
    if (process.env.NODE_ENV === "development") {
      const visibleRigs=[...prepared.rigs.values()].filter(rig=>rig.mesh.visible);
      console.assert(visibleRigs.length===(activeStepIndex<0?5:1),`Dissection visibility invariant: expected ${activeStepIndex<0?5:1}, found ${visibleRigs.length}`);
      if (!validated.current && p >= 0.965) {
        validated.current = true;
        prepared.rigs.forEach((rig) => {
          console.assert(
            equalsVector(rig.mesh.position, rig.original.position),
            `${rig.logical}: original position drift`,
          );
          console.assert(
            equalsQuaternion(rig.mesh.quaternion, rig.original.quaternion),
            `${rig.logical}: original quaternion drift`,
          );
          console.assert(
            equalsVector(rig.mesh.scale, rig.original.scale),
            `${rig.logical}: original scale drift`,
          );
          console.assert(
            equalsVector(rig.motion.position, rig.releaseOffset),
            `${rig.logical}: compact motion offset drift`,
          );
          console.assert(
            equalsQuaternion(rig.motion.quaternion, identity),
            `${rig.logical}: closed motion rotation`,
          );
          console.assert(
            equalsVector(rig.footprint.scale, tempPosition.set(1, 1, 1)),
            `${rig.logical}: closed anatomy scale`,
          );
        });
      }
    }
  }, -1);
  const initial = sampleStoryPose(0, size.width, size.height, rootPose.current);
  return (
    <group
      ref={root}
      name="BaklavaRoot"
      position={[initial.x, initial.y, initial.z]}
      scale={initial.scale}
    >
      <group ref={orientationGroup}>
        <group ref={spinGroup}>
          <group ref={chapterGroup}>
            <primitive object={prepared.scene} />
          </group>
        </group>
      </group>
    </group>
  );
}
