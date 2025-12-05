package com.smgp.smywinter2026.service;

import com.smgp.smywinter2026.domain.Vehicle;
import com.smgp.smywinter2026.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    public Vehicle getVehicleById(Integer id) {
        return vehicleRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Vehicle not found"));
    }

    public Vehicle createVehicle(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    public Vehicle updateVehicle(Integer id, Vehicle vehicle) {
        Vehicle existing = getVehicleById(id);
        existing.setName(vehicle.getName());
        existing.setVehicleNumber(vehicle.getVehicleNumber());
        existing.setCapacity(vehicle.getCapacity());
        existing.setDriverName(vehicle.getDriverName());
        existing.setDriverPhone(vehicle.getDriverPhone());
        existing.setDepartureTime(vehicle.getDepartureTime());
        existing.setDepartureLoc(vehicle.getDepartureLoc());
        existing.setMemo(vehicle.getMemo());
        return vehicleRepository.save(existing);
    }

    public void deleteVehicle(Integer id) {
        vehicleRepository.deleteById(id);
    }

    public List<Vehicle> searchVehicles(String name) {
        return vehicleRepository.findByNameContainingIgnoreCase(name);
    }
}
