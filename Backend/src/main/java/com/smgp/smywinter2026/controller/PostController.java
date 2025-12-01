package com.smgp.smywinter2026.controller;

import com.smgp.smywinter2026.domain.User;
import com.smgp.smywinter2026.model.dto.CreatePostRequestDto;
import com.smgp.smywinter2026.model.dto.PostDetailDto;
import com.smgp.smywinter2026.model.dto.PostSummaryDto;
import com.smgp.smywinter2026.repository.UserRepository;
import com.smgp.smywinter2026.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;
    private final UserRepository userRepository;

    // '나의 공책' 글 목록 조회
    @GetMapping("/my-notebook")
    public ResponseEntity<List<PostSummaryDto>> getMyNotebookPosts() {
        // TODO: 현재는 모든 NOTE 카테고리 글을 가져오지만, 추후 로그인한 사용자의 글만 가져오도록 수정 필요
        List<PostSummaryDto> posts = postService.findByCategory("NOTE");
        return ResponseEntity.ok(posts);
    }

    // '나의 공책' 글 작성
    @PostMapping("/my-notebook")
    public ResponseEntity<PostSummaryDto> createNotebookPost(@RequestBody CreatePostRequestDto requestDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // "NOTE" 카테고리로 게시글 생성
        com.smgp.smywinter2026.domain.Post createdPost = postService.createPost(requestDto, user, "NOTE");

        PostSummaryDto responseDto = new PostSummaryDto(createdPost.getId(), createdPost.getTitle(), user.getName(),
                createdPost.getCreatedAt());
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
    }

    // 특정 게시글 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<PostDetailDto> getPostById(@PathVariable Long id) {
        PostDetailDto post = postService.findById(id);
        return ResponseEntity.ok(post);
    }
}