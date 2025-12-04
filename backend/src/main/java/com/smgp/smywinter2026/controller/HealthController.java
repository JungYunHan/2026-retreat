package com.smgp.smywinter2026.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 헬스체크 및 시스템 상태 확인 컨트롤러
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class HealthController {

    private final DataSource dataSource;
    private final Environment environment;

    /**
     * 헬스체크 엔드포인트
     * GET /api/health
     * 응답: 서버 상태, DB 연결 상태, 환경 정보
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();

        // 기본 정보
        health.put("status", "UP");
        health.put("timestamp", LocalDateTime.now().toString());
        health.put("service", "smy-winter-2026");

        // 활성 프로필
        String[] activeProfiles = environment.getActiveProfiles();
        health.put("profile", activeProfiles.length > 0 ? activeProfiles[0] : "default");

        // DB 연결 체크
        Map<String, Object> database = new HashMap<>();
        try (Connection conn = dataSource.getConnection()) {
            database.put("status", "UP");
            database.put("database", conn.getMetaData().getDatabaseProductName());
            database.put("url", maskSensitiveInfo(conn.getMetaData().getURL()));
        } catch (Exception e) {
            database.put("status", "DOWN");
            database.put("error", e.getMessage());
        }
        health.put("database", database);

        // 환경 변수 체크 (민감 정보는 마스킹)
        Map<String, String> config = new HashMap<>();
        config.put("DB_URL", maskSensitiveInfo(environment.getProperty("spring.datasource.url")));
        config.put("DB_USERNAME", maskSensitiveInfo(environment.getProperty("spring.datasource.username")));
        config.put("DB_PASSWORD",
                environment.getProperty("spring.datasource.password") != null ? "***SET***" : "NOT_SET");
        config.put("JWT_SECRET", environment.getProperty("jwt.secret") != null ? "***SET***" : "NOT_SET");
        config.put("JWT_EXPIRATION", environment.getProperty("jwt.expiration-ms"));
        health.put("config", config);

        return ResponseEntity.ok(health);
    }

    /**
     * 간단한 핑 엔드포인트
     * GET /api/ping
     */
    @GetMapping("/ping")
    public ResponseEntity<Map<String, String>> ping() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "pong");
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    /**
     * 민감한 정보를 마스킹하는 헬퍼 메서드
     */
    private String maskSensitiveInfo(String info) {
        if (info == null) {
            return "NOT_SET";
        }

        // URL에서 비밀번호 마스킹 (예: postgresql://user:password@host:port/db)
        if (info.contains("://") && info.contains("@")) {
            int atIndex = info.indexOf("@");
            int colonIndex = info.lastIndexOf(":", atIndex);
            if (colonIndex > 0) {
                String prefix = info.substring(0, colonIndex + 1);
                String suffix = info.substring(atIndex);
                return prefix + "***" + suffix;
            }
        }

        // 일반 문자열은 앞 3자만 표시
        if (info.length() > 6) {
            return info.substring(0, 3) + "***";
        }

        return "***";
    }
}
