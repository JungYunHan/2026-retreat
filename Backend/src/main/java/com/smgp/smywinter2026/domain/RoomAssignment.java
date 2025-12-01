package com.smgp.smywinter2026.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "room_assignments")
@Getter
@Setter
public class RoomAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    private boolean isRoomLeader = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime assignedAt;

    // 편의 메서드
    public void setRoom(Room room) {
        this.room = room;
        room.getAssignments().add(this);
    }
}