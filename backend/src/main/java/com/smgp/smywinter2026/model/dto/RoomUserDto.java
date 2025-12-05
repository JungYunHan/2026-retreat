package com.smgp.smywinter2026.model.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class RoomUserDto {
    private final Long id;
    private final String username;
    private final String name;
    private final String phoneNumber;
    private final String gender;
    private final String teamName;
    private final String position;
}
