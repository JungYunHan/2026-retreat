package com.smgp.smywinter2026.model.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Getter
@RequiredArgsConstructor
public class RoomDto {
    private final Integer id;
    private final String name;
    private final Integer capacity;
    private final String genderType;
    private final String location;
    private final String memo;
    private final List<RoomAssignmentDto> assignments;
}
