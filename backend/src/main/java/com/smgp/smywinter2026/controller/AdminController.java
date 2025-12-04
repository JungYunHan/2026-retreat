package com.smgp.smywinter2026.controller;

import com.smgp.smywinter2026.domain.*;
import com.smgp.smywinter2026.model.dto.ApiResponse;
import com.smgp.smywinter2026.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 관리자 전용 컨트롤러 - DB 관리 기능
 * ADMIN 권한이 있는 사용자만 접근 가능
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final MenuRepository menuRepository;
    private final ScheduleRepository scheduleRepository;
    private final RoomRepository roomRepository;
    private final PasswordEncoder passwordEncoder;

    // ==================== 사용자 관리 ====================

    /**
     * 모든 사용자 조회
     * GET /api/admin/users
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    /**
     * 사용자 생성
     * POST /api/admin/users
     */
    @PostMapping("/users")
    public ResponseEntity<ApiResponse<User>> createUser(@RequestBody User user) {
        // 비밀번호 암호화
        if (user.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(savedUser));
    }

    /**
     * 사용자 수정
     * PUT /api/admin/users/{id}
     */
    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<User>> updateUser(
            @PathVariable Long id,
            @RequestBody User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 업데이트할 필드들
        if (userDetails.getName() != null)
            user.setName(userDetails.getName());
        if (userDetails.getEmail() != null)
            user.setEmail(userDetails.getEmail());
        if (userDetails.getPhoneNumber() != null)
            user.setPhoneNumber(userDetails.getPhoneNumber());
        if (userDetails.getTeamName() != null)
            user.setTeamName(userDetails.getTeamName());
        if (userDetails.getPosition() != null)
            user.setPosition(userDetails.getPosition());
        if (userDetails.getRole() != null)
            user.setRole(userDetails.getRole());
        if (userDetails.getGender() != null)
            user.setGender(userDetails.getGender());
        if (userDetails.getBirthDate() != null)
            user.setBirthDate(userDetails.getBirthDate());

        // 비밀번호 변경 시 암호화
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }

        User updatedUser = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(updatedUser));
    }

    /**
     * 사용자 삭제
     * DELETE /api/admin/users/{id}
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("사용자가 삭제되었습니다."));
    }

    // ==================== 게시글 관리 ====================

    /**
     * 모든 게시글 조회
     * GET /api/admin/posts
     */
    @GetMapping("/posts")
    public ResponseEntity<ApiResponse<List<Post>>> getAllPosts() {
        List<Post> posts = postRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(posts));
    }

    /**
     * 게시글 삭제
     * DELETE /api/admin/posts/{id}
     */
    @DeleteMapping("/posts/{id}")
    public ResponseEntity<ApiResponse<String>> deletePost(@PathVariable Long id) {
        postRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("게시글이 삭제되었습니다."));
    }

    // ==================== 메뉴 관리 ====================

    /**
     * 모든 메뉴 조회
     * GET /api/admin/menus
     */
    @GetMapping("/menus")
    public ResponseEntity<ApiResponse<List<Menu>>> getAllMenus() {
        List<Menu> menus = menuRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(menus));
    }

    /**
     * 메뉴 생성
     * POST /api/admin/menus
     */
    @PostMapping("/menus")
    public ResponseEntity<ApiResponse<Menu>> createMenu(@RequestBody Menu menu) {
        Menu savedMenu = menuRepository.save(menu);
        return ResponseEntity.ok(ApiResponse.success(savedMenu));
    }

    /**
     * 메뉴 수정
     * PUT /api/admin/menus/{id}
     * Note: Menu는 불변 객체이므로 수정 불가. 삭제 후 새로 생성 필요
     */
    @PutMapping("/menus/{id}")
    public ResponseEntity<ApiResponse<String>> updateMenu(
            @PathVariable Long id,
            @RequestBody Map<String, Object> menuDetails) {
        return ResponseEntity.ok(ApiResponse.error("메뉴는 불변 객체입니다. 삭제 후 새로 생성해주세요."));
    }

    /**
     * 메뉴 삭제
     * DELETE /api/admin/menus/{id}
     */
    @DeleteMapping("/menus/{id}")
    public ResponseEntity<ApiResponse<String>> deleteMenu(@PathVariable Long id) {
        menuRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("메뉴가 삭제되었습니다."));
    }

    // ==================== 스케줄 관리 ====================

    /**
     * 모든 스케줄 조회
     * GET /api/admin/schedules
     */
    @GetMapping("/schedules")
    public ResponseEntity<ApiResponse<List<Schedule>>> getAllSchedules() {
        List<Schedule> schedules = scheduleRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(schedules));
    }

    /**
     * 스케줄 생성
     * POST /api/admin/schedules
     */
    @PostMapping("/schedules")
    public ResponseEntity<ApiResponse<Schedule>> createSchedule(@RequestBody Schedule schedule) {
        Schedule savedSchedule = scheduleRepository.save(schedule);
        return ResponseEntity.ok(ApiResponse.success(savedSchedule));
    }

    /**
     * 스케줄 수정
     * PUT /api/admin/schedules/{id}
     */
    @PutMapping("/schedules/{id}")
    public ResponseEntity<ApiResponse<Schedule>> updateSchedule(
            @PathVariable Integer id,
            @RequestBody Schedule scheduleDetails) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("스케줄을 찾을 수 없습니다."));

        if (scheduleDetails.getTitle() != null)
            schedule.setTitle(scheduleDetails.getTitle());
        if (scheduleDetails.getDescription() != null)
            schedule.setDescription(scheduleDetails.getDescription());
        if (scheduleDetails.getLocation() != null)
            schedule.setLocation(scheduleDetails.getLocation());
        if (scheduleDetails.getStartTime() != null)
            schedule.setStartTime(scheduleDetails.getStartTime());
        if (scheduleDetails.getEndTime() != null)
            schedule.setEndTime(scheduleDetails.getEndTime());
        if (scheduleDetails.getDayNumber() != null)
            schedule.setDayNumber(scheduleDetails.getDayNumber());
        if (scheduleDetails.getCategory() != null)
            schedule.setCategory(scheduleDetails.getCategory());

        Schedule updatedSchedule = scheduleRepository.save(schedule);
        return ResponseEntity.ok(ApiResponse.success(updatedSchedule));
    }

    /**
     * 스케줄 삭제
     * DELETE /api/admin/schedules/{id}
     */
    @DeleteMapping("/schedules/{id}")
    public ResponseEntity<ApiResponse<String>> deleteSchedule(@PathVariable Integer id) {
        scheduleRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("스케줄이 삭제되었습니다."));
    }

    // ==================== 통계 정보 ====================

    /**
     * 전체 통계 조회
     * GET /api/admin/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getStats() {
        Map<String, Long> stats = Map.of(
                "totalUsers", userRepository.count(),
                "totalPosts", postRepository.count(),
                "totalMenus", menuRepository.count(),
                "totalSchedules", scheduleRepository.count(),
                "totalRooms", roomRepository.count());
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
