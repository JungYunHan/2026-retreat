package com.smgp.smywinter2026.config;

import com.smgp.smywinter2026.jwt.JwtAuthenticationFilter;
import com.smgp.smywinter2026.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtTokenProvider jwtTokenProvider;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                // 1. CORS 설정
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                                // 2. CSRF 보호 비활성화
                                .csrf(AbstractHttpConfigurer::disable)

                                // 3. HTTP Basic 및 Form Login 인증 비활성화
                                .httpBasic(AbstractHttpConfigurer::disable)
                                .formLogin(AbstractHttpConfigurer::disable)

                                // 4. 세션 관리를 STATELESS로 설정
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                                // 5. 요청별 인가 규칙 설정
                                .authorizeHttpRequests(auth -> auth
                                                // 정적 리소스와 루트 접근 허용
                                                .requestMatchers(
                                                                "/", "/index.html", "/404.html",
                                                                "/favicon.ico", "/robots.txt",
                                                                "/_not-found/**",
                                                                "/css/**", "/_next/**",
                                                                "*.js", "*.css", "*.svg", "*.png", "*.jpg", "*.ico",
                                                                "*.webp")
                                                .permitAll()
                                                // 공개 API 허용
                                                .requestMatchers("/api/auth/login", "/api/home", "/api/schedules",
                                                                "/api/health", "/api/ping")
                                                .permitAll()
                                                // 인증/권한 필요한 API
                                                .requestMatchers("/api/posts/my-notebook", "/api/mypage")
                                                .hasRole("USER")
                                                // 나머지 API는 인증 필요
                                                .requestMatchers("/api/**").authenticated()
                                                // API 이외의 나머지(정적/기타)는 허용
                                                .anyRequest().permitAll());

                // 6. JWT 인증 필터 추가
                http.addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider),
                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        // CORS 설정을 위한 Bean
        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                // Next.js 개발 서버 주소 + Render 배포 URL 허용
                configuration.setAllowedOrigins(List.of(
                                "http://localhost:3000",
                                "https://smy-winter-2026.onrender.com"));
                configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
                configuration.setAllowedHeaders(List.of("*"));
                configuration.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration); // 모든 경로에 대해 CORS 설정 적용
                return source;
        }

        // 비밀번호 암호화를 위한 PasswordEncoder Bean
        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        // AuthenticationManager Bean 등록
        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
                        throws Exception {
                return authenticationConfiguration.getAuthenticationManager();
        }
}