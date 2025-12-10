package com.smgp.smywinter2026.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * SPA 라우팅 구성 (Next.js 프론트엔드용)
 *
 * 목적:
 * - 서버에 도달한 클라이언트 라우트(예: /admin, /mypage, /posts/1)를
 * 정적 `index.html` 또는 특정 정적 파일로 포워딩하여 클라이언트 라우터가 처리하도록 합니다.
 *
 * 동작 원리 및 제외 대상:
 * - 정적 자원(파일명에 점 '.' 포함), `/api`로 시작하는 백엔드 API 경로,
 * 그리고 Next.js 빌드 출력(`/_next`, `/static` 등)은 포워딩 대상에서 제외합니다.
 * - 간단한 패턴(1~3 레벨)을 등록하여 일반적인 클라이언트 라우트를 포워딩합니다.
 *
 * 주의사항:
 * - 이 설정은 간단한 SPA 포워딩을 위한 해결책입니다. 복잡한 라우팅이 필요하면
 * 전용 컨트롤러로 처리하거나 path matching 전략을 검토하세요.
 */
@Configuration
public class SpaRouterConfig implements WebMvcConfigurer {

        @Override
        public void addViewControllers(@NonNull ViewControllerRegistry registry) {
                // SPA 라우팅: 정의되지 않은 클라이언트 라우트는 프론트엔드의
                // index.html 또는 전용 정적 파일(admin.html 등)로 포워딩합니다.
                // 주의: Spring Security 및 다른 컨트롤러 매핑과의 우선순위를
                // 고려해야 합니다. (/api, /_next 등은 제외)

                // 단일 세그먼트 경로 처리
                // (특정 경로를 전용 정적 파일로 서빙하는 경우 명시적으로 처리)
                // 예: /admin은 전용 정적 페이지(admin.html)로 포워딩
                registry.addViewController("/admin")
                                .setViewName("forward:/admin.html");
                registry.addViewController("/admin/{path:^(?!api$).*$}")
                                .setViewName("forward:/admin.html");

                // 단일 세그먼트 경로 (예: /mypage 등) - admin은 위에서 처리
                registry.addViewController("/{path:[^\\.]+}")
                                .setViewName("forward:/index.html");

                // 다중 세그먼트 경로 (예: /admin/users, /mypage/edit)
                registry.addViewController("/{path:[^\\.]+}/{subPath:[^\\.]+}")
                                .setViewName("forward:/index.html");

                // 3단계 경로도 지원
                registry.addViewController("/{path:[^\\.]+}/{subPath:[^\\.]+}/{subSubPath:[^\\.]+}")
                                .setViewName("forward:/index.html");
        }
}
