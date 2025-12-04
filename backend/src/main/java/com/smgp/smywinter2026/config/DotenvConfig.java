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
            ConfigurableEnvironment environment = applicationContext.getEnvironment();
            Map<String, Object> envMap = new HashMap<>();

            // 1. 시스템 환경 변수 우선 확인 (Render 등 클라우드 환경)
            Map<String, String> systemEnv = System.getenv();
            processEnvironmentVariables(systemEnv, envMap);

            // 2. .env 파일 확인 (로컬 개발 환경)
            String userDir = System.getProperty("user.dir");
            File rootEnv = new File(userDir, ".env");
            File backendEnv = new File(userDir, "backend/.env");

            if (rootEnv.exists() || backendEnv.exists()) {
                String chosenDir;
                if (rootEnv.exists()) {
                    chosenDir = userDir;
                } else {
                    chosenDir = new File(userDir, "backend").getAbsolutePath();
                }

                Dotenv dotenv = Dotenv.configure()
                        .directory(chosenDir)
                        .ignoreIfMissing()
                        .load();

                // .env 파일의 값으로 기존 envMap 업데이트 (중복 시 .env 우선)
                Map<String, String> dotenvMap = new HashMap<>();
                dotenv.entries().forEach(entry -> dotenvMap.put(entry.getKey(), entry.getValue()));
                processEnvironmentVariables(dotenvMap, envMap);

                System.out.println("[INFO] .env 파일 로드: " + chosenDir);
            }

            // 3. Spring 환경에 등록
            if (!envMap.isEmpty()) {
                environment.getPropertySources().addFirst(new MapPropertySource("dotenvProperties", envMap));
                System.out.println("[INFO] 환경 변수 로드 완료 - 키: " + envMap.keySet());
            } else {
                System.out.println("[WARN] 환경 변수가 로드되지 않았습니다.");
            }
        } catch (Exception e) {
            System.err.println("[ERROR] 환경 변수 로드 중 오류: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * 환경 변수를 Spring Boot 프로퍼티로 변환
     */
    private void processEnvironmentVariables(Map<String, String> source, Map<String, Object> target) {
        source.forEach((key, value) -> {
            switch (key) {
                case "DB_URL":
                    target.put("spring.datasource.url", value);
                    break;
                case "DB_USERNAME":
                    target.put("spring.datasource.username", value);
                    break;
                case "DB_PASSWORD":
                    target.put("spring.datasource.password", value);
                    break;
                case "JWT_SECRET":
                    target.put("jwt.secret", value);
                    break;
                case "JWT_EXPIRATION_MS":
                    target.put("jwt.expiration-ms", value);
                    break;
            }
        });
    }
}
