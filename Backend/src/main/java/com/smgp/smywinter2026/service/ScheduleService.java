package com.smgp.smywinter2026.service;

import com.smgp.smywinter2026.domain.Schedule;
import com.smgp.smywinter2026.model.dto.ScheduleDto;
import com.smgp.smywinter2026.model.dto.ScheduleItemDto;
import com.smgp.smywinter2026.repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;

    /**
     * 현재 시간 이후의 오늘 주요 일정을 5개까지 조회합니다.
     * 
     * @return 오늘 일정 리스트
     */
    public List<ScheduleItemDto> getTodaySchedules() {
        return scheduleRepository.findTop5ByStartTimeAfterOrderByStartTimeAsc(LocalDateTime.now())
                .stream()
                .map(schedule -> new ScheduleItemDto(schedule.getTitle(), schedule.getStartTime()))
                .collect(Collectors.toList());
    }

    /**
     * 모든 일정을 조회하여 날짜(dayNumber)별로 그룹화합니다.
     * 
     * @return 날짜별 일정 맵
     */
    public Map<Integer, List<ScheduleDto>> getAllSchedulesGroupedByDay() {
        // 1. DB에서 모든 일정을 '날짜(dayNumber)'와 '시작시간(startTime)' 순으로 정렬하여 가져옵니다.
        List<Schedule> allSchedules = scheduleRepository.findAll(Sort.by("dayNumber", "startTime"));

        // 2. 가져온 일정들을 DTO로 변환한 후, '날짜(dayNumber)' 기준으로 그룹화합니다.
        return allSchedules.stream()
                .map(schedule -> new ScheduleDto(
                        schedule.getId(),
                        schedule.getDayNumber(),
                        schedule.getTitle(),
                        schedule.getDescription(),
                        schedule.getStartTime(),
                        schedule.getEndTime(),
                        schedule.getLocation()))
                .collect(Collectors.groupingBy(ScheduleDto::getDayNumber));
    }
}