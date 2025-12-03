package com.smgp.smywinter2026.controller;

import com.smgp.smywinter2026.model.dto.ScheduleDto;
import com.smgp.smywinter2026.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping
    public ResponseEntity<Map<Integer, List<ScheduleDto>>> getAllSchedules() {
        Map<Integer, List<ScheduleDto>> schedulesByDay = scheduleService.getAllSchedulesGroupedByDay();
        return ResponseEntity.ok(schedulesByDay);
    }
}