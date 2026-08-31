import { Camera, Object3D, Vector3 } from "three";

const world = new Vector3();

export function projectWorldToScreen(object: Object3D | Vector3, camera: Camera, width: number, height: number, offsetY = 0) {
  if (object instanceof Vector3) world.copy(object); else object.getWorldPosition(world);
  world.y += offsetY;
  world.project(camera);
  return { x: (world.x * 0.5 + 0.5) * width, y: (-world.y * 0.5 + 0.5) * height };
}
