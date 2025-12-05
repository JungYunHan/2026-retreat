package com.smgp.smywinter2026.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class) // 생성일자 자동 관리를 위한 리스너
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(length = 20)
    private String category = "FREE"; // 기본값을 "FREE"로 설정

    @CreatedDate // 엔티티 생성 시 시간 자동 저장
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @JsonIgnore
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();

    // 생성자
    public Post(String title, String content, User user) {
        this.title = title;
        this.content = content;
        this.user = user;
    }

    public Post(String title, String content, User user, String category) {
        this.title = title;
        this.content = content;
        this.user = user;
        this.category = category;
    }

    // 게시글 수정을 위한 편의 메소드
    public void update(String title, String content) {
        this.title = title;
        this.content = content;
    }
}