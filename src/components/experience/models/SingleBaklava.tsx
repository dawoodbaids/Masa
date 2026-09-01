"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  Box3,
  Color,
  Euler,
  Group,
  Material,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  Quaternion,
  Vector3,
} from "three";
import { BAKLAVA_MODEL_URL } from "../modelAsset";
import {
  anatomyInspectionLocal,
  anatomyInspections,
  getAnatomyInspectionIndex,
} from "../content/anatomy";
import { expectedMeshes, MeshName } from "../content/story";
import { range, smooth } from "../controllers/math";
import {
  createRootPose,
  PRE_ANATOMY,
  sampleStoryPose,
} from "../controllers/sceneTimeline";
import type { ExperienceBridge } from "../experienceTypes";
import { getResponsiveProfile } from "../content/responsiveScenes";
import { tuneBakedMaterial } from "./materialTreatment";

type LogicalLayer = MeshName;
type Axis = "x" | "y" | "z";
type OriginalTransform = {
  position: Vector3;
  quaternion: Quaternion;
  scale: Vector3;
  colors: Color[];
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
  tempPosition = new Vector3(),
  tempFocus = new Vector3(),
  tempQuaternion = new Quaternion(),
  tempEuler = new Euler(),
  explodedBounds = new Box3(),
  explodedCenter = new Vector3();
const correction = (value: number) => MathUtils.clamp(value, 1, 1.42);
const UPPER_FILO_RELEASE = 0.16;
const LOWER_FILO_RELEASE = 0.15;
const ANATOMY_PHASE = Object.freeze({ explodeStart: 0.58, exploded: 0.68, reassemble: 0.89, assembled: 0.955 });
const isInternalFilo = (name: string) =>
  name.startsWith("UpperFilo") || name.startsWith("LowerFilo");
const PISTACHIO_ANATOMY_SCALE = Object.freeze({ x: 1.28, y: 1.18, z: 1.28 });
const cubic = (a: number, b: number, c: number, t: number) => {
  const u = 1 - t;
  return 3 * u * u * t * a + 3 * u * t * t * b + t * t * t * c;
};
const phasedAmount = (
  p: number,
  openStart: number,
  openEnd: number,
  closeStart: number,
  closeEnd: number,
) =>
  p < openStart
    ? 0
    : p < openEnd
      ? smooth(range(p, openStart, openEnd))
      : p < closeStart
        ? 1
        : p < closeEnd
          ? 1 - smooth(range(p, closeStart, closeEnd))
          : 0;
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
    validated = useRef(false),
    rootPose = useRef(createRootPose()),
    rootQuaternion = useRef(new Quaternion()),
    idleRotation = useRef(0),
    { size } = useThree();
  const prepared = useMemo(() => {
    const scene = gltf.scene.clone(true),
      physical = new Map<MeshName, Mesh>(),
      internalMeshes: Mesh[] = [];
    scene.traverse((child) => {
      if (!(child instanceof Mesh)) return;
      if (isInternalFilo(child.name)) {
        child.visible = false;
        internalMeshes.push(child);
      }
      if (!expectedMeshes.includes(child.name as MeshName)) return;
      const array = Array.isArray(child.material),
        source = array ? child.material : [child.material],
        materials = source.map((material: Material) => {
          const clone = material.clone();
          clone.transparent = true;
          return clone;
        });
      child.material = array ? materials : materials[0];
      child.castShadow = false;
      child.receiveShadow = false;
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
          colors: materials.map((material) =>
            material instanceof MeshStandardMaterial
              ? material.color.clone()
              : new Color(1, 1, 1),
          ),
        },
        assembledSize = dimensions.get(LAYER_MAPPING[logical])!.clone(),
        anatomyScale = new Vector3(1, 1, 1),
        filo = logical === "UpperFilo" || logical === "LowerFilo";
      materials.forEach((material) => tuneBakedMaterial(material, logical));
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
      let dist = Math.abs(toAxis) * 0.32;
      if (rig.logical === "UpperFilo") dist = UPPER_FILO_RELEASE;
      else if (rig.logical === "LowerFilo") dist = LOWER_FILO_RELEASE;
      rig.releaseOffset.set(0, 0, 0);
      rig.releaseOffset[verticalAxis] = direction * dist;
      rig.anatomyPosition.set(toX, toY, toZ);
    });
    scene.updateMatrixWorld(true);
    const box = new Box3().setFromObject(scene),
      extent = box.getSize(new Vector3()),
      center = box.getCenter(new Vector3()),
      normalizer = 1.32 / Math.max(extent.x, extent.y, extent.z);
    scene.scale.setScalar(normalizer);
    scene.position.copy(center).multiplyScalar(-normalizer);
    return { scene, rigs, verticalAxis, internalMeshes };
  }, [gltf.scene]);
  useEffect(() => {
    const anchors: Partial<Record<LogicalLayer, Mesh>> = {};
    prepared.rigs.forEach((rig, logical) => (anchors[logical] = rig.mesh));
    bridge.pastry.current = anchors;
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
          RELEASE_position: rig.releaseOffset.toArray(),
          ANATOMY_position: rig.anatomyPosition.toArray(),
          ASSEMBLED_scale: rig.original.scale.toArray(),
          RELEASE_scale: rig.original.scale.toArray(),
          ANATOMY_scale: rig.anatomyScale.toArray(),
          releaseOffsetAlong: prepared.verticalAxis,
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
      bridge.pastry.current = {};
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
    const p = bridge.progress.current.current,
      profile = getResponsiveProfile(size.width, size.height),
      mobile = profile.mode === "mobile",
      pose = sampleStoryPose(p, size.width, size.height, rootPose.current),
      rotationProgress = smooth(range(p, PRE_ANATOMY.start, PRE_ANATOMY.end)),
      anatomyRotationWeight =
        smooth(range(p, 0.5, 0.66)) * (1 - smooth(range(p, 0.91, 0.98))),
      idleRotationSpeed = (Math.PI * 2) / 21,
      explosionAmount = phasedAmount(
        p,
        ANATOMY_PHASE.explodeStart,
        ANATOMY_PHASE.exploded,
        ANATOMY_PHASE.reassemble,
        ANATOMY_PHASE.assembled,
      ),
      index = getAnatomyInspectionIndex(p),
      inspection = index >= 0 ? anatomyInspections[index] : null,
      local = inspection ? anatomyInspectionLocal(p) : 0,
      focus = inspection
        ? smooth(range(local, 0.05, 0.2)) *
          (1 - smooth(range(local, 0.8, 0.96)))
        : 0,
      motionScale = mobile ? profile.explosion : 1;
    idleRotation.current =
      (idleRotation.current +
        delta * idleRotationSpeed * MathUtils.lerp(1, 0.05, anatomyRotationWeight)) %
      (Math.PI * 2);
    tempEuler.set(
      pose.rotationX,
      pose.rotationY + rotationProgress * Math.PI * 2 + idleRotation.current,
      pose.rotationZ,
    );
    rootQuaternion.current.setFromEuler(tempEuler);
    group.position.set(pose.x, pose.y, pose.z);
    group.quaternion.copy(rootQuaternion.current);
    group.scale.setScalar(
      pose.scale * (mobile ? MathUtils.lerp(1, 0.86, explosionAmount) : 1),
    );
    prepared.rigs.forEach((rig) => {
      const isFilo = rig.logical === "UpperFilo" || rig.logical === "LowerFilo",
        active = inspection?.layers.includes(rig.logical) ?? false,
        focusAmount = active ? focus : 0,
        s = rig.spec,
        mobileY = mobile ? profile.anatomySpacing : 1,
        mobileZ = mobile ? 0.78 : 1;
      if (isFilo) {
        const revealOpacity = smooth(range(explosionAmount, 0.015, 0.14));
        rig.mesh.visible = explosionAmount > 0.001;
        tempPosition.set(
          rig.anatomyPosition.x * motionScale * explosionAmount,
          rig.anatomyPosition.y * mobileY * explosionAmount,
          rig.anatomyPosition.z * mobileZ * explosionAmount,
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
        rig.materials.forEach((material) => {
          material.opacity = revealOpacity;
          material.depthWrite = revealOpacity > 0.98;
        });
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
      tempFocus
        .set(s.focus[0], s.focus[1], s.focus[2] * mobileZ)
        .multiplyScalar(focusAmount);
      if (mobile) tempFocus.set(0, 0, 0);
      rig.motion.position.copy(tempPosition).add(tempFocus);
      tempQuaternion.slerpQuaternions(
        identity,
        rig.focusQuaternion,
        focusAmount,
      );
      if (!mobile) rig.motion.quaternion.multiply(tempQuaternion);
      rig.mesh.position.copy(rig.original.position);
      rig.mesh.quaternion.copy(rig.original.quaternion);
      rig.mesh.scale.copy(rig.original.scale);
      if (mobile && active)
        rig.footprint.scale.multiplyScalar(1 + 0.012 * focus);
      rig.materials.forEach((material, i) => {
        if (!isFilo) {
          material.opacity = 1;
          material.depthWrite = true;
        } else {
          material.depthWrite = material.opacity > 0.98;
        }
        if (material instanceof MeshStandardMaterial) {
          material.color.copy(rig.original.colors[i]);
          material.emissive.set(
            active && rig.logical === "Pistachio" ? "#283318" : "#000000",
          );
          material.emissiveIntensity = active ? 0.055 * focus : 0;
        }
      });
    });
    if (mobile && explosionAmount > 0) {
      group.updateWorldMatrix(true, true);
      explodedBounds.setFromObject(group).getCenter(explodedCenter);
      group.position.y +=
        MathUtils.clamp(
          profile.anatomyCenterY - explodedCenter.y,
          -0.18,
          0.18,
        ) * explosionAmount;
    }
    if (process.env.NODE_ENV === "development") {
      const anatomyStable = p >= 0.685 && p < 0.89;
      if (anatomyStable)
        prepared.rigs.forEach((rig) => {
          if (rig.logical === "UpperFilo" || rig.logical === "LowerFilo") {
            console.assert(
              equalsVector(rig.footprint.scale, rig.anatomyScale),
              `${rig.logical}: anatomy scale changed during focus`,
            );
            console.assert(rig.mesh.visible, `${rig.logical}: hidden during anatomy stable`);
          }
        });
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
            rig.motion.position.lengthSq() < 1e-12,
            `${rig.logical}: closed motion offset`,
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
      rotation={[initial.rotationX, initial.rotationY, initial.rotationZ]}
      scale={initial.scale}
    >
      <primitive object={prepared.scene} />
    </group>
  );
}
