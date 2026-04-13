package com.ltweb.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ltweb.backend.entity.Seat;

public interface SeatRepository extends JpaRepository<Seat, String> {

    List<Seat> findByRoomId(Long roomId);

    Optional<Seat> findByRoomIdAndSeatCode(Long roomId, String seatCode);

    boolean existsByRoomIdAndSeatCode(Long roomId, String seatCode);
}
