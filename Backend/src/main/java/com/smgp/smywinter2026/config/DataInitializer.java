package com.smgp.smywinter2026.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import com.smgp.smywinter2026.domain.Post;
import com.smgp.smywinter2026.domain.Schedule;
import com.smgp.smywinter2026.domain.User;
import com.smgp.smywinter2026.repository.PostRepository;
import com.smgp.smywinter2026.repository.ScheduleRepository;
import com.smgp.smywinter2026.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ScheduleRepository scheduleRepository; // ScheduleRepository 주입
    private final PostRepository postRepository; // PostRepository 주입

    @Override
    public void run(String... args) throws Exception {
        // 데이터베이스에 "testuser" 사용자가 없으면 새로 생성
        if (userRepository.findByUsername("testuser").isEmpty()) {
            User testUser = User.builder()
                    .username("testuser")
                    .password(passwordEncoder.encode("password")) // 비밀번호를 암호화하여 저장
                    .name("테스트유저")
                    .phoneNumber("010-1234-5678") // 필수 필드 추가
                    .gender("M") // 필수 필드 추가 (M/F)
                    .email("user@example.com")
                    .role("USER") // 역할 부여
                    .passwordChangeRequired(false) // 테스트 유저는 비밀번호 변경 불필요
                    .build();
            userRepository.save(testUser);
        }

        // 데이터베이스에 일정이 하나도 없으면 샘플 일정 데이터 생성
        if (scheduleRepository.count() == 0) {
            // 1일차 샘플 일정
            Schedule schedule1 = new Schedule();
            schedule1.setDayNumber(1);
            schedule1.setTitle("개회 예배");
            schedule1.setDescription("수련회의 시작을 알리는 예배입니다.");
            schedule1.setStartTime(LocalDateTime.of(2026, 1, 20, 19, 0));
            schedule1.setEndTime(LocalDateTime.of(2026, 1, 20, 20, 30));
            schedule1.setLocation("본당");
            scheduleRepository.save(schedule1);

            // 2일차 샘플 일정
            Schedule schedule2 = new Schedule();
            schedule2.setDayNumber(2);
            schedule2.setTitle("오전 특강: 공동체");
            schedule2.setDescription("공동체의 의미와 중요성에 대한 특강입니다.");
            schedule2.setStartTime(LocalDateTime.of(2026, 1, 21, 10, 0));
            schedule2.setEndTime(LocalDateTime.of(2026, 1, 21, 11, 30));
            schedule2.setLocation("세미나실 A");
            scheduleRepository.save(schedule2);
        }

        // 데이터베이스에 공지사항이 하나도 없으면 샘플 공지 데이터 생성
        if (postRepository.findTop5ByCategoryOrderByCreatedAtDesc("NOTICE").isEmpty()) {
            User adminUser = userRepository.findByUsername("testuser").orElse(null);
            if (adminUser != null) {
                Post notice1 = new Post("수련회에 오신 것을 환영합니다!", "함께 기쁨의 여정을 만들어가요.", adminUser);
                notice1.setCategory("NOTICE");
                postRepository.save(notice1);

                Post notice2 = new Post("전체 일정 안내", "전체 일정 페이지에서 세부 일정을 확인해주세요.", adminUser);
                notice2.setCategory("NOTICE");
                postRepository.save(notice2);
            }
        }
    }
}