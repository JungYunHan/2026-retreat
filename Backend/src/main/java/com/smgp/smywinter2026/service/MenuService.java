package com.smgp.smywinter2026.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smgp.smywinter2026.domain.Menu;
import com.smgp.smywinter2026.model.dto.MenuDto;
import com.smgp.smywinter2026.repository.MenuRepository;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuService {

    private static final Logger logger = LoggerFactory.getLogger(MenuService.class);
    private final MenuRepository menuRepository;

    @Transactional(readOnly = true)
    public MenuDto getTodaysMenu() {
        LocalDate today = LocalDate.now();
        logger.info("오늘 날짜({})의 메뉴를 DB에서 조회합니다.", today);
        List<Menu> todaysMenus = menuRepository.findByMenuDate(today);
        logger.info("조회된 메뉴 수: {}", todaysMenus.size());

        if (todaysMenus.isEmpty()) {
            logger.warn("오늘의 메뉴 정보가 DB에 없습니다.");
            return new MenuDto(); // 오늘의 메뉴 정보가 없으면 비어있는 DTO 객체를 반환
        }

        MenuDto menuDto = new MenuDto();
        for (Menu menu : todaysMenus) {
            MenuDto.Meal meal = new MenuDto.Meal();
            meal.setMainDish(menu.getMainDish());
            meal.setSideDishes(menu.getSideDishes());

            switch (menu.getMealType()) {
                case BREAKFAST -> menuDto.setBreakfast(meal);
                case LUNCH -> menuDto.setLunch(meal);
                case DINNER -> menuDto.setDinner(meal);
            }
        }
        logger.info("가공된 오늘의 메뉴 DTO: 아침={}, 점심={}, 저녁={}",
                menuDto.getBreakfast() != null ? menuDto.getBreakfast().getMainDish() : "없음",
                menuDto.getLunch() != null ? menuDto.getLunch().getMainDish() : "없음",
                menuDto.getDinner() != null ? menuDto.getDinner().getMainDish() : "없음");
        return menuDto;
    }
}