import type {NextConfig} from "next";

const nextConfig:NextConfig={
  outputFileTracingRoot:process.cwd(),
  async headers(){return [{source:"/Media/:path*.glb",headers:[{key:"Cache-Control",value:"public, max-age=31536000, immutable"}]}]},
};

export default nextConfig;
