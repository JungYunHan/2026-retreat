package com.smgp.smywinter2026.model.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class SimpleNoticeDto {
    private final Long id;
    private final String title;
}