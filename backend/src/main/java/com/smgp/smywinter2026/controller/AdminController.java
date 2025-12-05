package com.smgp.smywinter2026.controller;

import com.smgp.smywinter2026.domain.*;
import com.smgp.smywinter2026.model.dto.ApiResponse;
import com.smgp.smywinter2026.model.dto.RoomAssignmentDto;
import com.smgp.smywinter2026.model.dto.RoomDto;
import com.smgp.smywinter2026.model.dto.RoomUserDto;
import com.smgp.smywinter2026.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
        if (userDetails.getUsername() != null)
            user.setUsername(userDetails.getUsername());
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
     */
    @PutMapping("/menus/{id}")
    public ResponseEntity<ApiResponse<Menu>> updateMenu(
            @PathVariable Long id,
            @RequestBody Menu menuDetails) {
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("메뉴를 찾을 수 없습니다."));

        if (menuDetails.getMenuDate() != null)
            menu.setMenuDate(menuDetails.getMenuDate());
        if (menuDetails.getMealType() != null)
            menu.setMealType(menuDetails.getMealType());
        if (menuDetails.getMainDish() != null)
            menu.setMainDish(menuDetails.getMainDish());
        if (menuDetails.getSideDishes() != null)
            menu.setSideDishes(menuDetails.getSideDishes());

        Menu updatedMenu = menuRepository.save(menu);
        return ResponseEntity.ok(ApiResponse.success(updatedMenu));
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

    // ==================== 숙소 관리 ====================

    /**
     * 모든 숙소 조회
     * GET /api/admin/rooms
     */
    @GetMapping("/rooms")
    public ResponseEntity<ApiResponse<List<RoomDto>>> getAllRooms() {
        List<RoomDto> rooms = roomRepository.findAll().stream()
                .map(this::toRoomDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(rooms));
    }

    /**
     * 숙소 생성
     * POST /api/admin/rooms
     */
    @PostMapping("/rooms")
    public ResponseEntity<ApiResponse<RoomDto>> createRoom(@RequestBody Room room) {
        Room savedRoom = roomRepository.save(room);
        return ResponseEntity.ok(ApiResponse.success(toRoomDto(savedRoom)));
    }

    /**
     * 숙소 수정
     * PUT /api/admin/rooms/{id}
     */
    @PutMapping("/rooms/{id}")
    public ResponseEntity<ApiResponse<RoomDto>> updateRoom(
            @PathVariable Integer id,
            @RequestBody Room roomDetails) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("숙소를 찾을 수 없습니다."));

        if (roomDetails.getName() != null)
            room.setName(roomDetails.getName());
        if (roomDetails.getCapacity() != null)
            room.setCapacity(roomDetails.getCapacity());
        if (roomDetails.getGenderType() != null)
            room.setGenderType(roomDetails.getGenderType());
        if (roomDetails.getLocation() != null)
            room.setLocation(roomDetails.getLocation());
        if (roomDetails.getMemo() != null)
            room.setMemo(roomDetails.getMemo());

        Room updatedRoom = roomRepository.save(room);
        return ResponseEntity.ok(ApiResponse.success(toRoomDto(updatedRoom)));
    }

    /**
     * 숙소 삭제
     * DELETE /api/admin/rooms/{id}
     */
    @DeleteMapping("/rooms/{id}")
    public ResponseEntity<ApiResponse<String>> deleteRoom(@PathVariable Integer id) {
        roomRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("숙소가 삭제되었습니다."));
    }

    private RoomDto toRoomDto(Room room) {
        List<RoomAssignmentDto> assignments = room.getAssignments().stream()
                .map(this::toRoomAssignmentDto)
                .collect(Collectors.toList());

        return new RoomDto(
                room.getId(),
                room.getName(),
                room.getCapacity(),
                room.getGenderType(),
                room.getLocation(),
                room.getMemo(),
                assignments);
    }

    private RoomAssignmentDto toRoomAssignmentDto(RoomAssignment assignment) {
        User user = assignment.getUser();
        RoomUserDto userDto = new RoomUserDto(
                user.getId(),
                user.getUsername(),
                user.getName(),
                user.getPhoneNumber(),
                user.getGender(),
                user.getTeamName(),
                user.getPosition());

        return new RoomAssignmentDto(
                assignment.getId(),
                assignment.isRoomLeader(),
                assignment.getAssignedAt(),
                userDto);
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
