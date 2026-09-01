import { Camera, Object3D, Vector3 } from "three";

const world = new Vector3();

export type ProjectionRect={left:number;top:number;width:number;height:number};

export function projectWorldToScreen(object: Object3D | Vector3, camera: Camera, widthOrRect: number|ProjectionRect, height=0, offsetY = 0) {
  if (object instanceof Vector3) world.copy(object); else object.getWorldPosition(world);
  world.y += offsetY;
  world.project(camera);
  const rect=typeof widthOrRect==="number"?{left:0,top:0,width:widthOrRect,height}:widthOrRect;
  return { x: rect.left+(world.x * 0.5 + 0.5) * rect.width, y: rect.top+(-world.y * 0.5 + 0.5) * rect.height };
}
