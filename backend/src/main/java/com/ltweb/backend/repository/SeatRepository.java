package com.ltweb.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ltweb.backend.entity.Seat;

public interface SeatRepository extends JpaRepository<Seat, String> {

    @EntityGraph(attributePaths = { "room" })
    Optional<Seat> findById(String id);

    @EntityGraph(attributePaths = { "room" })
    List<Seat> findByRoomId(Long roomId);

    boolean existsByRoomIdAndSeatCode(Long roomId, String seatCode);

    void deleteByRoomId(Long roomId);
}
