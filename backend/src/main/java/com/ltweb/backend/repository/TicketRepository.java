package com.ltweb.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ltweb.backend.entity.Ticket;

public interface TicketRepository extends JpaRepository<Ticket, String> {

    @EntityGraph(attributePaths = { "seat", "showtime" })
    List<Ticket> findAll();

    @EntityGraph(attributePaths = { "seat", "showtime" })
    List<Ticket> findByShowtimeId(String showtimeId);

    Optional<Ticket> findByShowtimeIdAndSeatId(String showtimeId, String seatId);

    void deleteByShowtimeId(String showtimeId);
}
