import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Spring Boot와 통합하기 위해 정적(static) 파일로 export하도록 설정합니다.
  output: "export",
  
  // 정적 export 시 이미지 최적화 비활성화 (unoptimized 설정)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
