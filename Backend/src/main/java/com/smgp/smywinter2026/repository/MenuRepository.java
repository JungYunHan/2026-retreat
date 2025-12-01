package com.smgp.smywinter2026.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smgp.smywinter2026.domain.Menu;

import java.time.LocalDate;
import java.util.List;

public interface MenuRepository extends JpaRepository<Menu, Long> {
    // 특정 날짜에 해당하는 모든 메뉴를 조회하는 쿼리 메서드
    List<Menu> findByMenuDate(LocalDate date);
}