package com.smgp.smywinter2026.repository;

import com.smgp.smywinter2026.domain.VehicleAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface VehicleAssignmentRepository extends JpaRepository<VehicleAssignment, Long> {
    @Query("SELECT va FROM VehicleAssignment va JOIN FETCH va.user JOIN FETCH va.vehicle ORDER BY va.vehicle.name, va.isVehicleLeader DESC")
    List<VehicleAssignment> findAllWithUserAndVehicle();
}