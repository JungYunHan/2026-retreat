package com.smgp.smywinter2026.controller;

import com.smgp.smywinter2026.domain.User;
import com.smgp.smywinter2026.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequiredArgsConstructor
public class PasswordController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/change-password")
    public String changePasswordForm(Model model) {
        model.addAttribute("pageTitle", "비밀번호 변경");
        model.addAttribute("activeTab", "mypage"); // 마이페이지의 하위 기능이므로 mypage 탭 활성화
        model.addAttribute("isHomePage", false);
        return "change-password"; // templates/change-password.html
    }

    @PostMapping("/change-password")
    public String processChangePassword(@RequestParam String newPassword,
            @RequestParam String confirmPassword,
            RedirectAttributes redirectAttributes) {

        if (!newPassword.equals(confirmPassword)) {
            redirectAttributes.addFlashAttribute("error", "새 비밀번호가 일치하지 않습니다.");
            return "redirect:/change-password";
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordChangeRequired(false); // 비밀번호 변경 완료
        userRepository.save(user);

        redirectAttributes.addFlashAttribute("success", "비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.");
        return "redirect:/login";
    }
}