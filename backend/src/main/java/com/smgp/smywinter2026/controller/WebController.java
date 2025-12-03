package com.smgp.smywinter2026.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class WebController implements ErrorController {

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