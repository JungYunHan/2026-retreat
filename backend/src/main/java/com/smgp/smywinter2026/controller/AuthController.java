package com.smgp.smywinter2026.controller;

import com.smgp.smywinter2026.jwt.JwtTokenProvider;
import com.smgp.smywinter2026.model.dto.ApiResponse;
import com.smgp.smywinter2026.model.dto.LoginRequestDto;
import com.smgp.smywinter2026.model.dto.LoginResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * 로그인 API
     * POST /api/auth/login
     * 요청: { "username": "user1", "password": "password123" }
     * 응답: { "success": true, "data": { "accessToken": "jwt-token-here" } }
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponseDto>> login(@RequestBody LoginRequestDto loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtTokenProvider.createToken(authentication);
        return ResponseEntity.ok(ApiResponse.success(new LoginResponseDto(token)));
    }
}