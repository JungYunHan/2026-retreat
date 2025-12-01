package com.smgp.smywinter2026.repository;

import com.smgp.smywinter2026.domain.RoomAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RoomAssignmentRepository extends JpaRepository<RoomAssignment, Long> {
    @Query("SELECT ra FROM RoomAssignment ra JOIN FETCH ra.user JOIN FETCH ra.room ORDER BY ra.room.name, ra.isRoomLeader DESC")
    List<RoomAssignment> findAllWithUserAndRoom();
}