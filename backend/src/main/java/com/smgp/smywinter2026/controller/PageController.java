package com.smgp.smywinter2026.controller;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smgp.smywinter2026.domain.User;
import com.smgp.smywinter2026.model.dto.ApiResponse;
import com.smgp.smywinter2026.model.dto.HomeDataDto;
import com.smgp.smywinter2026.model.dto.MenuDto;
import com.smgp.smywinter2026.model.dto.MyPageDto;
import com.smgp.smywinter2026.model.dto.ScheduleItemDto;
import com.smgp.smywinter2026.model.dto.SimpleNoticeDto;
import com.smgp.smywinter2026.repository.UserRepository;
import com.smgp.smywinter2026.service.MenuService;
import com.smgp.smywinter2026.service.PostService;
import com.smgp.smywinter2026.service.ScheduleService;

@RestController
@RequestMapping("/api")
public class PageController {

    private final MenuService menuService;
    private final ScheduleService scheduleService;
    private final PostService postService;
    private final UserRepository userRepository;

    public PageController(MenuService menuService, ScheduleService scheduleService, PostService postService,
            UserRepository userRepository) {
        this.menuService = menuService;
        this.scheduleService = scheduleService;
        this.postService = postService;
        this.userRepository = userRepository;
    }

    /**
     * 홈 화면 데이터 조회
     * GET /api/home
     * 응답: D-Day, 오늘 일정, 오늘 메뉴, 최신 공지사항
     */
    @GetMapping("/home")
    public ResponseEntity<ApiResponse<HomeDataDto>> getHomeData() {
        LocalDate retreatDate = LocalDate.of(2026, 1, 23);
        long dDay = ChronoUnit.DAYS.between(LocalDate.now(), retreatDate);

        List<ScheduleItemDto> scheduleItems = scheduleService.getTodaySchedules();
        MenuDto menu = menuService.getTodaysMenu();
        List<SimpleNoticeDto> latestNotices = postService.findLatestNotices(5);

        HomeDataDto homeData = new HomeDataDto(dDay, scheduleItems, menu, latestNotices);

        return ResponseEntity.ok(ApiResponse.success(homeData));
    }

    /**
     * 마이페이지 데이터 조회 (인증 필요)
     * GET /api/mypage
     * 응답: 사용자 프로필 정보
     */
    @GetMapping("/mypage")
    public ResponseEntity<ApiResponse<MyPageDto>> getMyPageData() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("인증이 필요합니다."));
        }

        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        MyPageDto myPageDto = new MyPageDto(
                user.getName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getTeamName(),
                user.getPosition(),
                user.getRole());

        return ResponseEntity.ok(ApiResponse.success(myPageDto));
    }
}