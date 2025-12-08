package com.smgp.smywinter2026.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * SPA(Single Page Application) 라우팅 설정
 * Next.js 프론트엔드의 모든 라우트를 index.html로 포워딩합니다.
 * /api 경로는 제외합니다 (백엔드 API는 정상 처리).
 */
@Configuration
public class SpaRouterConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(@NonNull ViewControllerRegistry registry) {
        // SPA 라우팅: 정의되지 않은 경로는 모두 index.html로 포워딩
        // Spring Security와 Controller 이전에 매칭되도록 주의
        // 예: /admin, /mypage, /login 등은 index.html로 → React Router가 처리

        // 단일 세그먼트 경로 (예: /admin, /mypage)
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
