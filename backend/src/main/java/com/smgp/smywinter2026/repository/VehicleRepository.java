package com.smgp.smywinter2026.repository;

import com.smgp.smywinter2026.domain.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Integer> {
    List<Vehicle> findByNameContainingIgnoreCase(String name);
}
