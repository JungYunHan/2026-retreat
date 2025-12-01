package com.smgp.smywinter2026.model.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class MyPageDto {
    private final String name;
    private final String email;
    private final String phoneNumber;
    private final String teamName;
    private final String position;
    private final String role;
}