import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Spring Boot와 통합하기 위해 정적(static) 파일로 export하도록 설정합니다.
  output: "export",
  
  // 정적 export 시 이미지 최적화 비활성화 (unoptimized 설정)
  images: {
    unoptimized: true,
  },

  // Next.js export 모드에서 app 라우터의 클라이언트 라우팅을 위해 trailingSlash 추가
  trailingSlash: true,
};

export default nextConfig;
