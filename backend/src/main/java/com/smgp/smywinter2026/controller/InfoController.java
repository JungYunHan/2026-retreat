package com.smgp.smywinter2026.controller;

import com.smgp.smywinter2026.domain.Room;
import com.smgp.smywinter2026.domain.RoomAssignment;
import com.smgp.smywinter2026.domain.Vehicle;
import com.smgp.smywinter2026.domain.VehicleAssignment;
import com.smgp.smywinter2026.repository.RoomAssignmentRepository;
import com.smgp.smywinter2026.repository.VehicleAssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@RequiredArgsConstructor
public class InfoController {

    private final RoomAssignmentRepository roomAssignmentRepository;
    private final VehicleAssignmentRepository vehicleAssignmentRepository;

    @GetMapping("/info/rooms")
    public String roomAssignmentsPage(Model model) {
        // 1. DB에서 모든 숙소 배정 정보를 User, Room 정보와 함께 가져옵니다.
        List<RoomAssignment> allAssignments = roomAssignmentRepository.findAllWithUserAndRoom();

        // 2. 가져온 배정 정보들을 '방(Room)' 기준으로 그룹화합니다.
        Map<Room, List<RoomAssignment>> assignmentsByRoom = allAssignments.stream()
                .collect(Collectors.groupingBy(RoomAssignment::getRoom));

        model.addAttribute("assignmentsByRoom", assignmentsByRoom);
        model.addAttribute("pageTitle", "숙소 배정");
        model.addAttribute("isHomePage", false);
        return "info/rooms"; // templates/info/rooms.html
    }

    @GetMapping("/info/transportation")
    public String vehicleAssignmentsPage(Model model) {
        // 1. DB에서 모든 차량 배정 정보를 User, Vehicle 정보와 함께 가져옵니다.
        List<VehicleAssignment> allAssignments = vehicleAssignmentRepository.findAllWithUserAndVehicle();

        // 2. 가져온 배정 정보들을 '차량(Vehicle)' 기준으로 그룹화합니다.
        Map<Vehicle, List<VehicleAssignment>> assignmentsByVehicle = allAssignments.stream()
                .collect(Collectors.groupingBy(VehicleAssignment::getVehicle));

        model.addAttribute("assignmentsByVehicle", assignmentsByVehicle);
        model.addAttribute("pageTitle", "차량 안내");
        model.addAttribute("isHomePage", false);
        return "info/transportation"; // templates/info/transportation.html
    }
}