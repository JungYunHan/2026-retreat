package com.smgp.smywinter2026.repository;

import com.smgp.smywinter2026.domain.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    // 필요한 커스텀 쿼리 메소드를 여기에 추가할 수 있습니다.
}