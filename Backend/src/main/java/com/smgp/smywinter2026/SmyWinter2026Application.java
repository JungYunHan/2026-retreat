package com.smgp.smywinter2026;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling // 주기적인 작업을 활성화합니다.
@EnableJpaAuditing // JPA Auditing 기능 활성화
public class SmyWinter2026Application {

	public static void main(String[] args) {
		SpringApplication.run(SmyWinter2026Application.class, args);
	}

}
