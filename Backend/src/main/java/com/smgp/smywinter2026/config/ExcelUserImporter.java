package com.smgp.smywinter2026.config;

import com.smgp.smywinter2026.domain.User;
import com.smgp.smywinter2026.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.InputStream;

@Component
@RequiredArgsConstructor
@Profile("import") // 'import' 프로필이 활성화될 때만 이 컴포넌트가 실행됩니다.
public class ExcelUserImporter implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(ExcelUserImporter.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        logger.info("====================================================");
        logger.info("  [ExcelUserImporter] 엑셀 파일 사용자 가져오기 시작 ");
        logger.info("====================================================");

        // src/main/resources 폴더에 있는 엑셀 파일을 읽어옵니다.
        ClassPathResource resource = new ClassPathResource("user-data.xlsx");

        try (InputStream inputStream = resource.getInputStream();
                Workbook workbook = new XSSFWorkbook(inputStream)) {

            Sheet sheet = workbook.getSheetAt(0); // 첫 번째 시트를 가져옵니다.

            // 첫 번째 행(헤더)은 건너뛰고 두 번째 행부터 읽습니다.
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null)
                    continue;

                String username = row.getCell(0).getStringCellValue();
                String plainPassword = row.getCell(1).getStringCellValue(); // 암호화되지 않은 비밀번호
                String name = row.getCell(2).getStringCellValue();
                String phoneNumber = row.getCell(3).getStringCellValue();
                String gender = row.getCell(4).getStringCellValue();
                String email = row.getCell(5).getStringCellValue();
                String teamName = row.getCell(6).getStringCellValue();
                String position = row.getCell(7).getStringCellValue();

                // 이미 존재하는 사용자인지 확인합니다.
                if (userRepository.findByUsername(username).isPresent()) {
                    logger.warn(">> 이미 존재하는 사용자입니다: {}", username);
                    continue;
                }

                User newUser = User.builder()
                        .username(username)
                        .password(passwordEncoder.encode(plainPassword)) // ✨ 비밀번호를 암호화합니다.
                        .name(name)
                        .phoneNumber(phoneNumber)
                        .gender(gender)
                        .email(email)
                        .teamName(teamName)
                        .position(position)
                        .role("USER") // 기본 역할 부여
                        .passwordChangeRequired(true) // 최초 로그인 시 비밀번호 변경 필요
                        .build();

                userRepository.save(newUser);
                logger.info(">> 사용자 등록 성공: {}", username);
            }
        }
        logger.info("====================================================");
        logger.info("  [ExcelUserImporter] 모든 사용자 가져오기 완료      ");
        logger.info("====================================================");
    }
}