package com.smgp.smywinter2026.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.lang.NonNull;

import java.util.HashMap;
import java.util.Map;
import java.io.File;

/**
 * .env 파일을 읽어 Spring 환경변수로 로드하는 설정 클래스
 */
public class DotenvConfig implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(@NonNull ConfigurableApplicationContext applicationContext) {
        try {
            // 실행 위치 기준으로 .env 탐색 (루트 / backend 폴더)
            String userDir = System.getProperty("user.dir");
            File rootEnv = new File(userDir, ".env");
            File backendEnv = new File(userDir, "backend/.env");
            String chosenDir;
            if (rootEnv.exists()) {
                chosenDir = userDir; // 루트에 존재
            } else if (backendEnv.exists()) {
                chosenDir = new File(userDir, "backend").getAbsolutePath();
            } else {
                chosenDir = userDir; // 둘 다 없으면 기본
            }

            Dotenv dotenv = Dotenv.configure()
                    .directory(chosenDir)
                    .ignoreIfMissing()
                    .load();

            ConfigurableEnvironment environment = applicationContext.getEnvironment();
            Map<String, Object> envMap = new HashMap<>();

            // .env 파일의 모든 값을 Spring 환경변수로 변환
            dotenv.entries().forEach(entry -> {
                String key = entry.getKey();
                String value = entry.getValue();

                // Spring Boot 프로퍼티로 변환
                switch (key) {
                    case "DB_URL":
                        envMap.put("spring.datasource.url", value);
                        break;
                    case "DB_USERNAME":
                        envMap.put("spring.datasource.username", value);
                        break;
                    case "DB_PASSWORD":
                        envMap.put("spring.datasource.password", value);
                        break;
                    case "JWT_SECRET":
                        envMap.put("jwt.secret", value);
                        break;
                    case "JWT_EXPIRATION_MS":
                        envMap.put("jwt.expiration-ms", value);
                        break;
                }
            });

            environment.getPropertySources().addFirst(new MapPropertySource("dotenvProperties", envMap));

            if (envMap.isEmpty()) {
                System.out.println("[WARN] .env 값이 로드되지 않았습니다. 경로 확인 필요: " + chosenDir);
            } else {
                System.out.println("[INFO] .env 로드 경로: " + chosenDir + " / 로드된 키: " + envMap.keySet());
            }
        } catch (Exception e) {
            System.err.println("[WARN] .env 파일 로드 중 오류 발생: " + e.getMessage());
        }
    }
}
