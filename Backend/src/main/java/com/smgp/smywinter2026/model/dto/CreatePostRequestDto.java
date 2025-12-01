package com.smgp.smywinter2026.model.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter // JSON 역직렬화를 위해 Setter 필요
public class CreatePostRequestDto {
    private String title;
    private String content;
}