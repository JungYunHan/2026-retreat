package com.smgp.smywinter2026.repository;

import com.smgp.smywinter2026.domain.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule, Integer> {
    List<Schedule> findTop5ByStartTimeAfterOrderByStartTimeAsc(LocalDateTime now);
}