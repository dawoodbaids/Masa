import {DataTexture,LinearFilter,Material,MeshPhysicalMaterial,MeshStandardMaterial,RedFormat,RepeatWrapping,UnsignedByteType} from "three";
let filoRidges:DataTexture|undefined;
function getFiloRidges(){
 if(filoRidges)return filoRidges;
 const height=128,data=new Uint8Array(height);
 for(let y=0;y<height;y++){const wave=Math.sin(y/height*Math.PI*26);data[y]=Math.round(128+wave*34+(y%17===0?24:0))}
 filoRidges=new DataTexture(data,1,height,RedFormat,UnsignedByteType);
 filoRidges.wrapS=RepeatWrapping;filoRidges.wrapT=RepeatWrapping;filoRidges.repeat.set(1,2.2);filoRidges.magFilter=LinearFilter;filoRidges.minFilter=LinearFilter;filoRidges.needsUpdate=true;
 return filoRidges;
}
export function treatAsBakedFilo(material:Material){
 if(!(material instanceof MeshStandardMaterial))return;
 material.metalness=0;material.roughness=.78;material.bumpMap=getFiloRidges();material.bumpScale=.018;material.envMapIntensity=.32;
 if(material instanceof MeshPhysicalMaterial)material.specularIntensity=.28;
 // TODO: Replace this procedural ridge map with a photographed/scanned toasted-filo
 // normal map once the brand supplies the final production texture set.
 material.needsUpdate=true;
}
