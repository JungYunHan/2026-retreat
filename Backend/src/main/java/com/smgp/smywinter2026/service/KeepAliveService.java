package com.smgp.smywinter2026.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class KeepAliveService {

    private static final Logger logger = LoggerFactory.getLogger(KeepAliveService.class);
    private final RestTemplate restTemplate = new RestTemplate();

    // Render가 제공하는 외부 접속 URL을 환경 변수에서 주입받습니다.
    // 만약 환경 변수가 없으면 (로컬 환경 등) 빈 문자열이 됩니다.
    @Value("${RENDER_EXTERNAL_URL:}")
    private String appUrl;

    // 14분마다 이 메소드를 실행합니다. (Render의 슬립 시간은 15분)
    @Scheduled(fixedRateString = "840000") // 14 * 60 * 1000 = 840000 밀리초
    public void keepAlive() {
        if (appUrl != null && !appUrl.isEmpty()) {
            try {
                restTemplate.getForObject(appUrl, String.class);
                logger.info("Keep-alive ping sent to {}", appUrl);
            } catch (Exception e) {
                logger.error("Failed to send keep-alive ping to {}", appUrl, e);
            }
        }
    }
}