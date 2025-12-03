package com.smgp.smywinter2026.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rooms")
@Getter
@Setter
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 50)
    private String name;

    private Integer capacity = 0;

    @Column(nullable = false, length = 10)
    private String genderType;

    @Column(length = 100)
    private String location;

    @Column(columnDefinition = "TEXT")
    private String memo;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RoomAssignment> assignments = new ArrayList<>();
}