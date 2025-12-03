package com.smgp.smywinter2026.repository; // ⚠️ 본인의 프로젝트 패키지 경로에 맞게 수정하세요.

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;

@Component
public class DatabaseConnectionLogger implements CommandLineRunner {

    // SLF4J 로거 생성
    private static final Logger logger = LoggerFactory.getLogger(DatabaseConnectionLogger.class);

    private final DataSource dataSource;

    // 생성자를 통해 DataSource 빈을 주입받습니다.
    public DatabaseConnectionLogger(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(String... args) throws Exception {
        logger.info("================= DB CONNECTION INFO =================");
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            logger.info("✅ DB URL      : {}", metaData.getURL());
            logger.info("✅ DB Username : {}", metaData.getUserName());
        } catch (Exception e) {
            logger.error("❌ FAILED TO CONNECT TO DATABASE", e);
        }
        logger.info("====================================================");
    }
}