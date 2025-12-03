package com.smgp.smywinter2026.config;

import com.smgp.smywinter2026.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class CustomAuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        String username = authentication.getName();

        // findByUsername이 Optional<User>를 반환하므로 orElseThrow로 처리
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("인증된 사용자를 DB에서 찾을 수 없습니다: " + username));

        if (user.isPasswordChangeRequired()) {
            // 비밀번호 변경이 필요하면, 변경 페이지로 직접 리다이렉트
            getRedirectStrategy().sendRedirect(request, response, "/change-password");
        } else {
            // 그렇지 않으면 기본 성공 URL(홈)로 직접 리다이렉트
            getRedirectStrategy().sendRedirect(request, response, "/home");
        }
    }
}