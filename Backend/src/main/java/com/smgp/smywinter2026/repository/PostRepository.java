package com.smgp.smywinter2026.repository;

import com.smgp.smywinter2026.domain.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findTop5ByCategoryOrderByCreatedAtDesc(String category);

    // 모든 게시글을 생성일자(createdAt) 기준 내림차순으로 정렬하여 찾는 쿼리 메서드
    List<Post> findAllByOrderByCreatedAtDesc();

    List<Post> findByCategoryOrderByCreatedAtDesc(String category);
}