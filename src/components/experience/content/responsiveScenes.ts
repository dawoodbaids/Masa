export type ViewportMode="mobile"|"tablet"|"desktop";
export type ViewportKind="compact"|"phone"|"tall"|"large"|"landscape"|"tablet"|"desktop";
export type ResponsiveProfile={mode:ViewportMode;kind:ViewportKind;width:number;height:number;aspect:number;scale:number;horizontal:number;vertical:number;depth:number;rotation:number;cameraZ:number;anatomyCameraZ:number;fov:number;explosion:number;anatomySpacing:number;focusGap:number;stageCenterY:number;anatomyCenterY:number;safeTop:number;safeBottom:number};

const desktop={mode:"desktop" as const,kind:"desktop" as const,scale:1.17,horizontal:1,vertical:1,depth:1,rotation:1,cameraZ:4.85,anatomyCameraZ:5.43,fov:34,explosion:1,anatomySpacing:1,focusGap:0,stageCenterY:0,anatomyCenterY:-.12,safeTop:.08,safeBottom:.22};

/** Central 3D stage resolver. Both dimensions and the resulting aspect ratio affect framing. */
export function getResponsiveProfile(width:number,height:number):ResponsiveProfile{
 const w=Math.max(1,width),h=Math.max(1,height),aspect=h/w;
 if(w>=1100)return{...desktop,width:w,height:h,aspect};
 if(w>=721){const short=h<760,portrait=h>w;return{mode:"tablet",kind:"tablet",width:w,height:h,aspect,scale:portrait?1.22:1.12,horizontal:.88,vertical:short?.78:.94,depth:.88,rotation:.94,cameraZ:portrait?5.12:5.3,anatomyCameraZ:portrait?5.7:5.95,fov:35,explosion:short?.8:.94,anatomySpacing:1,focusGap:0,stageCenterY:portrait?.015:0,anatomyCenterY:portrait?-.09:-.03,safeTop:.1,safeBottom:portrait?.22:.16}}
 if(h<=500||w/h>1.25)return{mode:"mobile",kind:"landscape",width:w,height:h,aspect,scale:1.02,horizontal:.48,vertical:.48,depth:.7,rotation:.88,cameraZ:6.05,anatomyCameraZ:6.75,fov:38,explosion:.58,anatomySpacing:.64,focusGap:.025,stageCenterY:.02,anatomyCenterY:0,safeTop:.14,safeBottom:.22};
 const compact=h<=700,veryTall=aspect>=2.12,large=w>=415,kind:ViewportKind=compact?"compact":large?"large":veryTall?"tall":"phone";
 const heightFit=Math.min(1,Math.max(.78,(h-560)/300+.78)),widthFit=Math.min(1.08,Math.max(.84,w/390));
 const scale=(compact?1.20:veryTall?1.36:large?1.34:1.29)*Math.min(widthFit,.93+heightFit*.1);
 const usableHeight=h*(1-.13-(compact?.3:.27)),anatomySpacing=Math.min(1.28,Math.max(.86,usableHeight/515));
 return{mode:"mobile",kind,width:w,height:h,aspect,scale,horizontal:compact?.42:large?.52:.47,vertical:compact?.62:veryTall?.94:.79,depth:.76,rotation:.9,cameraZ:compact?5.72:veryTall?5.35:5.48,anatomyCameraZ:compact?6.18:veryTall?5.86:5.98,fov:compact?39:large?37:38,explosion:compact?.78:veryTall?.98:large?.94:.9,anatomySpacing,focusGap:.045+Math.max(0,anatomySpacing-1)*.035,stageCenterY:compact?.07:veryTall?.16:.11,anatomyCenterY:compact?.02:veryTall?.12:.07,safeTop:.13,safeBottom:compact?.3:.27};
}

export const ENVIRONMENT={intro:[249,247,242],transition:[151,126,101],inside:[16,12,9],ink:[42,30,21],cream:[246,238,224],darkStart:.43,darkFull:.58,lightStart:.925,lightFull:.99} as const;
export const CINEMATIC_CAMERA={mobile:{pointer:0,idle:.006,heroPush:.2,craftPush:.08,heatPush:.14,syrupPush:.24,texturePush:.32},tablet:{pointer:.018,idle:.007,heroPush:.16,craftPush:.06,heatPush:.12,syrupPush:.2,texturePush:.27},desktop:{pointer:.032,idle:.008,heroPush:.13,craftPush:.05,heatPush:.1,syrupPush:.17,texturePush:.24}} as const;
export function viewportMode(width:number):ViewportMode{return width<721?"mobile":width<1100?"tablet":"desktop"}
