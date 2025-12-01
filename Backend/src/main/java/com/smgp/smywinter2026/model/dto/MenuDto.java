package com.smgp.smywinter2026.model.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
public class MenuDto {
    private Meal breakfast;
    private Meal lunch;
    private Meal dinner;

    @Getter
    @Setter
    @NoArgsConstructor
    public static class Meal {
        private String mainDish;
        private String sideDishes;
    }
}