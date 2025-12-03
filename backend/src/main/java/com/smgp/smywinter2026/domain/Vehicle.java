package com.smgp.smywinter2026.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vehicles")
@Getter
@Setter
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 20)
    private String vehicleNumber;

    private Integer capacity = 45;

    @Column(length = 50)
    private String driverName;

    @Column(length = 20)
    private String driverPhone;

    private LocalDateTime departureTime;

    @Column(length = 100)
    private String departureLoc;

    @Column(columnDefinition = "TEXT")
    private String memo;

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VehicleAssignment> assignments = new ArrayList<>();
}