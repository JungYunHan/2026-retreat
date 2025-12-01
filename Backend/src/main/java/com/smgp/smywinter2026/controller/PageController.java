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
@RequestMapping("/api") // 모든 경로에 /api 접두사 추가
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

    @GetMapping("/home")
    public ResponseEntity<HomeDataDto> getHomeData() {
        LocalDate retreatDate = LocalDate.of(2026, 1, 23);
        long dDay = ChronoUnit.DAYS.between(LocalDate.now(), retreatDate);

        List<ScheduleItemDto> scheduleItems = scheduleService.getTodaySchedules();
        MenuDto menu = menuService.getTodaysMenu();
        List<SimpleNoticeDto> latestNotices = postService.findLatestNotices(5);

        HomeDataDto homeData = new HomeDataDto(dDay, scheduleItems, menu, latestNotices);

        return ResponseEntity.ok(homeData);
    }

    /*
     * /write 페이지는 데이터를 불러오는 것이 아니라, 단순히 페이지를 보여주는 역할이었습니다.
     * Next.js와 같은 프론트엔드 프레임워크에서는 이 라우팅을 프론트엔드에서 자체적으로 처리합니다.
     * 따라서 이 API 엔드포인트는 더 이상 필요하지 않습니다.
     */

    @GetMapping("/mypage")
    public ResponseEntity<MyPageDto> getMyPageData() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            // 인증되지 않은 사용자에 대한 처리 (예: 401 Unauthorized)
            return ResponseEntity.status(401).build();
        }

        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found")); // 혹은 다른 예외 처리

        // Entity를 직접 노출하지 않고, 필요한 데이터만 담은 DTO로 변환하여 반환합니다.
        MyPageDto myPageDto = new MyPageDto(
                user.getName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getTeamName(),
                user.getPosition(),
                user.getRole());

        return ResponseEntity.ok(myPageDto);
    }
}