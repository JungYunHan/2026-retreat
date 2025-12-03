package com.smgp.smywinter2026.model.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Getter
@RequiredArgsConstructor
public class HomeDataDto {
    private final long dDay;
    private final List<ScheduleItemDto> scheduleItems;
    private final MenuDto menu;
    private final List<SimpleNoticeDto> latestNotices;
}