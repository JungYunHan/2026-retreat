package com.smgp.smywinter2026.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class WebController implements ErrorController {

    // Next.js static export 페이지 라우팅 처리
    // 각 페이지 경로에 대해 해당 HTML 파일로 포워딩
    // 참고: /login은 LoginController에서 처리

    @GetMapping("/mypage")
    public String mypage() {
        return "forward:/mypage.html";
    }

    @GetMapping("/admin")
    public String admin() {
        return "forward:/admin.html";
    }

    @GetMapping("/admin/users")
    public String adminUsers() {
        return "forward:/admin/users.html";
    }

    @GetMapping("/admin/posts")
    public String adminPosts() {
        return "forward:/admin/posts.html";
    }

    @GetMapping("/admin/schedules")
    public String adminSchedules() {
        return "forward:/admin/schedules.html";
    }

    @GetMapping("/admin/menus")
    public String adminMenus() {
        return "forward:/admin/menus.html";
    }

    @GetMapping("/admin/rooms")
    public String adminRooms() {
        return "forward:/admin/rooms.html";
    }

    @GetMapping("/admin/vehicles")
    public String adminVehicles() {
        return "forward:/admin/vehicles.html";
    }

    @RequestMapping("/error")
    public String handleError(HttpServletRequest request) {
        String path = request.getRequestURI();
        // API 요청이 아닌 경우에만 index.html로 포워딩
        if (!path.startsWith("/api/")) {
            return "forward:/index.html";
        }
        // API 요청에서 에러가 발생한 경우 기본 에러 페이지를 따름 (혹은 별도 JSON 에러 응답 처리)
        return "forward:/index.html";
    }
}