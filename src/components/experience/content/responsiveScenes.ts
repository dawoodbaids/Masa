export type ViewportMode="mobile"|"tablet"|"desktop";
export const SCENES={mobile:{scale:1.3,horizontal:.92,vertical:.9,depth:.78,rotation:.9,cameraZ:5.35,anatomyCameraZ:5.9},tablet:{scale:1.18,horizontal:.9,vertical:.92,depth:.88,rotation:.94,cameraZ:5.15,anatomyCameraZ:5.65},desktop:{scale:1.17,horizontal:1,vertical:1,depth:1,rotation:1,cameraZ:4.85,anatomyCameraZ:5.43}} as const;
export const ENVIRONMENT={intro:[249,247,242],transition:[151,126,101],inside:[16,12,9],ink:[42,30,21],cream:[246,238,224],darkStart:.43,darkFull:.58,lightStart:.925,lightFull:.99} as const;

export const CINEMATIC_CAMERA = {
  mobile: { pointer: 0, idle: .006, heroPush: .2, craftPush: .08, heatPush: .14, syrupPush: .24, texturePush: .32 },
  tablet: { pointer: .018, idle: .007, heroPush: .16, craftPush: .06, heatPush: .12, syrupPush: .2, texturePush: .27 },
  desktop: { pointer: .032, idle: .008, heroPush: .13, craftPush: .05, heatPush: .1, syrupPush: .17, texturePush: .24 },
} as const;
export function viewportMode(width:number):ViewportMode{return width<720?"mobile":width<1100?"tablet":"desktop"}
