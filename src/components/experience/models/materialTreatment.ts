import {Material,MeshPhysicalMaterial,MeshStandardMaterial} from "three";
import type {MeshName} from "../content/story";

export type BakedMaterialSnapshot={roughness:number;metalness:number;envMapIntensity:number;specularIntensity?:number;specularColor?:[number,number,number];clearcoat?:number;clearcoatRoughness?:number};

export function tuneBakedMaterial(material:Material,layer:MeshName){
 if(!(material instanceof MeshStandardMaterial))return null;
 const original:BakedMaterialSnapshot={roughness:material.roughness,metalness:material.metalness,envMapIntensity:material.envMapIntensity},filo=layer==="UpperFilo"||layer==="LowerFilo",pistachio=layer==="Pistachio";
 material.metalness=0;
 material.roughness=pistachio?.95:filo?.9:.82;
 material.envMapIntensity=pistachio?.1:filo?.12:.2;
 if(material instanceof MeshPhysicalMaterial){original.specularIntensity=material.specularIntensity;original.specularColor=[material.specularColor.r,material.specularColor.g,material.specularColor.b];original.clearcoat=material.clearcoat;original.clearcoatRoughness=material.clearcoatRoughness;material.specularIntensity=pistachio?.08:filo?.1:.18;material.specularColor.setRGB(1,1,1);material.clearcoat=pistachio||filo?0:.03;material.clearcoatRoughness=.9}
 material.needsUpdate=true;
 return original;
}
