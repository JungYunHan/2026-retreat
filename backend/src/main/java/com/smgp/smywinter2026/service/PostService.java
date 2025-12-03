package com.smgp.smywinter2026.service;

import com.smgp.smywinter2026.domain.Post;
import com.smgp.smywinter2026.domain.User;
import com.smgp.smywinter2026.model.dto.CreatePostRequestDto;
import com.smgp.smywinter2026.model.dto.PostDetailDto;
import com.smgp.smywinter2026.model.dto.SimpleNoticeDto;
import com.smgp.smywinter2026.model.dto.PostSummaryDto;
import com.smgp.smywinter2026.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {

    private final PostRepository postRepository;

    /**
     * 특정 카테고리의 모든 게시글을 최신순으로 조회합니다.
     * 
     * @param category 게시글 카테고리
     * @return 게시글 리스트
     */
    public List<PostSummaryDto> findByCategory(String category) {
        return postRepository.findByCategoryOrderByCreatedAtDesc(category)
                .stream()
                .map(post -> new PostSummaryDto(
                        post.getId(),
                        post.getTitle(),
                        post.getUser().getName(),
                        post.getCreatedAt()))
                .collect(Collectors.toList());
    }

    /**
     * 특정 ID의 게시글을 조회합니다.
     * 
     * @param id 게시글 ID
     * @return 게시글 상세 정보
     */
    public PostDetailDto findById(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid post Id: " + id));
        return new PostDetailDto(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                post.getUser().getName(),
                post.getCreatedAt());
    }

    @Transactional
    public Post createPost(CreatePostRequestDto requestDto, User author, String category) {
        Post post = new Post(requestDto.getTitle(), requestDto.getContent(), author, category);
        return postRepository.save(post);
    }

    /**
     * 최신 공지사항을 지정된 개수만큼 조회합니다.
     * 'NOTICE' 카테고리를 기준으로 합니다.
     * 
     * @param limit 조회할 개수
     * @return 최신 공지 리스트
     */
    public List<SimpleNoticeDto> findLatestNotices(int limit) {
        return postRepository.findTop5ByCategoryOrderByCreatedAtDesc("NOTICE")
                .stream()
                .map(post -> new SimpleNoticeDto(post.getId(), post.getTitle()))
                .collect(Collectors.toList());
    }
}