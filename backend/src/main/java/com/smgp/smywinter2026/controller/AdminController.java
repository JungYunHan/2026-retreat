package com.smgp.smywinter2026.controller;

import com.smgp.smywinter2026.domain.*;
import com.smgp.smywinter2026.model.dto.ApiResponse;
import com.smgp.smywinter2026.model.dto.RoomAssignmentDto;
import com.smgp.smywinter2026.model.dto.RoomDto;
import com.smgp.smywinter2026.model.dto.RoomUserDto;
import com.smgp.smywinter2026.repository.*;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
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
    private final VehicleRepository vehicleRepository;
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

    /**
     * 비밀번호 초기화
     * POST /api/admin/users/{id}/reset-password
     */
    @PostMapping("/users/{id}/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        String newPassword = request.get("newPassword");
        if (newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("새 비밀번호를 입력해주세요."));
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordChangeRequired(true);
        userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.success("비밀번호가 초기화되었습니다."));
    }

    /**
     * CSV 파일로 사용자 일괄 업로드
     * POST /api/admin/users/bulk-upload
     */
    @PostMapping("/users/bulk-upload")
    public ResponseEntity<ApiResponse<Map<String, Object>>> bulkUploadUsers(@RequestParam("file") MultipartFile file) {
        try {
            List<User> successCount = new ArrayList<>();
            List<String> errors = new ArrayList<>();
            
            InputStreamReader reader = new InputStreamReader(file.getInputStream(), "UTF-8");
            CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT.withFirstRecordAsHeader().withIgnoreEmptyLines());
            
            for (CSVRecord record : csvParser) {
                try {
                    // 헤더에서 BOM 제거 후 필드 접근
                    String username = record.get("username").trim();
                    String password = record.get("password").trim();
                    String name = record.get("name").trim();
                    String email = record.get("email").trim();
                    String phoneNumber = record.get("phoneNumber").trim();
                    String teamName = record.get("teamName").trim();
                    String position = record.get("position").trim();
                    String gender = record.get("gender").trim();
                    
                    User user = new User();
                    user.setUsername(username);
                    user.setPassword(passwordEncoder.encode(password));
                    user.setName(name);
                    user.setEmail(email);
                    user.setPhoneNumber(phoneNumber);
                    user.setTeamName(teamName);
                    user.setPosition(position);
                    user.setGender(gender);
                    user.setRole("USER");
                    
                    userRepository.save(user);
                    successCount.add(user);
                } catch (Exception e) {
                    errors.add("행 " + record.getRecordNumber() + ": " + e.getMessage());
                }
            }
            csvParser.close();
            
            return ResponseEntity.ok(ApiResponse.success(Map.of(
                "successCount", successCount.size(),
                "totalCount", successCount.size() + errors.size(),
                "errors", errors
            )));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("CSV 파일 처리 실패: " + e.getMessage()));
        }
    }

    /**
     * 사용자 일괄 삭제
     * DELETE /api/admin/users/bulk-delete
     */
    @PostMapping("/users/bulk-delete")
    public ResponseEntity<ApiResponse<String>> bulkDeleteUsers(@RequestBody List<Long> userIds) {
        userRepository.deleteAllById(userIds);
        return ResponseEntity.ok(ApiResponse.success(userIds.size() + "명의 사용자가 삭제되었습니다."));
    }

    /**
     * 사용자 일괄 수정
     * PUT /api/admin/users/bulk-update
     */
    @PutMapping("/users/bulk-update")
    public ResponseEntity<ApiResponse<Map<String, Object>>> bulkUpdateUsers(
            @RequestBody List<Map<String, Object>> updateList) {
        List<String> errors = new ArrayList<>();
        int successCount = 0;
        
        for (Map<String, Object> update : updateList) {
            try {
                Long userId = Long.parseLong(update.get("id").toString());
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
                
                if (update.containsKey("name")) user.setName(update.get("name").toString());
                if (update.containsKey("email")) user.setEmail(update.get("email").toString());
                if (update.containsKey("phoneNumber")) user.setPhoneNumber(update.get("phoneNumber").toString());
                if (update.containsKey("teamName")) user.setTeamName(update.get("teamName").toString());
                if (update.containsKey("position")) user.setPosition(update.get("position").toString());
                if (update.containsKey("gender")) user.setGender(update.get("gender").toString());
                
                userRepository.save(user);
                successCount++;
            } catch (Exception e) {
                errors.add("ID " + update.get("id") + ": " + e.getMessage());
            }
        }
        
        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "successCount", successCount,
            "totalCount", updateList.size(),
            "errors", errors
        )));
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
     * 게시글 생성
     * POST /api/admin/posts
     */
    @PostMapping("/posts")
    public ResponseEntity<ApiResponse<Post>> createPost(@RequestBody Post post) {
        Post savedPost = postRepository.save(post);
        return ResponseEntity.ok(ApiResponse.success(savedPost));
    }

    /**
     * 게시글 수정
     * PUT /api/admin/posts/{id}
     */
    @PutMapping("/posts/{id}")
    public ResponseEntity<ApiResponse<Post>> updatePost(
            @PathVariable Long id,
            @RequestBody Post postDetails) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));

        if (postDetails.getTitle() != null)
            post.setTitle(postDetails.getTitle());
        if (postDetails.getContent() != null)
            post.setContent(postDetails.getContent());
        if (postDetails.getCategory() != null)
            post.setCategory(postDetails.getCategory());
        if (postDetails.getUser() != null)
            post.setUser(postDetails.getUser());

        Post updatedPost = postRepository.save(post);
        return ResponseEntity.ok(ApiResponse.success(updatedPost));
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
                "totalRooms", roomRepository.count(),
                "totalVehicles", vehicleRepository.count());
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    // ==================== 차량 관리 ====================

    /**
     * 모든 차량 조회
     * GET /api/admin/vehicles
     */
    @GetMapping("/vehicles")
    public ResponseEntity<ApiResponse<List<Vehicle>>> getAllVehicles() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(vehicles));
    }

    /**
     * 차량 생성
     * POST /api/admin/vehicles
     */
    @PostMapping("/vehicles")
    public ResponseEntity<ApiResponse<Vehicle>> createVehicle(@RequestBody Vehicle vehicle) {
        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        return ResponseEntity.ok(ApiResponse.success(savedVehicle));
    }

    /**
     * 차량 수정
     * PUT /api/admin/vehicles/{id}
     */
    @PutMapping("/vehicles/{id}")
    public ResponseEntity<ApiResponse<Vehicle>> updateVehicle(
            @PathVariable Integer id,
            @RequestBody Vehicle vehicleDetails) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("차량을 찾을 수 없습니다."));

        if (vehicleDetails.getName() != null)
            vehicle.setName(vehicleDetails.getName());
        if (vehicleDetails.getVehicleNumber() != null)
            vehicle.setVehicleNumber(vehicleDetails.getVehicleNumber());
        if (vehicleDetails.getCapacity() != null)
            vehicle.setCapacity(vehicleDetails.getCapacity());
        if (vehicleDetails.getDriverName() != null)
            vehicle.setDriverName(vehicleDetails.getDriverName());
        if (vehicleDetails.getDriverPhone() != null)
            vehicle.setDriverPhone(vehicleDetails.getDriverPhone());
        if (vehicleDetails.getDepartureTime() != null)
            vehicle.setDepartureTime(vehicleDetails.getDepartureTime());
        if (vehicleDetails.getDepartureLoc() != null)
            vehicle.setDepartureLoc(vehicleDetails.getDepartureLoc());
        if (vehicleDetails.getMemo() != null)
            vehicle.setMemo(vehicleDetails.getMemo());

        Vehicle updatedVehicle = vehicleRepository.save(vehicle);
        return ResponseEntity.ok(ApiResponse.success(updatedVehicle));
    }

    /**
     * 차량 삭제
     * DELETE /api/admin/vehicles/{id}
     */
    @DeleteMapping("/vehicles/{id}")
    public ResponseEntity<ApiResponse<String>> deleteVehicle(@PathVariable Integer id) {
        vehicleRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("차량이 삭제되었습니다."));
    }
}
