package com.smgp.smywinter2026.service;

import com.smgp.smywinter2026.repository.UserRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class UserDetailService implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .map(user -> {
                    // role이 이미 ROLE_ prefix가 있는지 확인
                    String role = user.getRole();
                    log.info("사용자 {} 의 DB role: {}", username, role);

                    if (role.startsWith("ROLE_")) {
                        // 이미 ROLE_ prefix가 있으면 authorities() 사용
                        log.info("ROLE_ prefix 있음 - authorities() 사용");
                        return User.withUsername(user.getUsername())
                                .password(user.getPassword())
                                .authorities(role)
                                .build();
                    } else {
                        // ROLE_ prefix가 없으면 roles() 사용 (자동으로 ROLE_ 붙음)
                        log.info("ROLE_ prefix 없음 - roles() 사용 -> ROLE_{} 로 변환", role);
                        return User.withUsername(user.getUsername())
                                .password(user.getPassword())
                                .roles(role)
                                .build();
                    }
                })
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
    }
}