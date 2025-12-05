package com.smgp.smywinter2026.model.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;

@Getter
@RequiredArgsConstructor
public class RoomAssignmentDto {
    private final Long id;
    private final boolean roomLeader;
    private final LocalDateTime assignedAt;
    private final RoomUserDto user;
}
