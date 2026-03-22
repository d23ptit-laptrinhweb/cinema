package com.ltweb.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ltweb.backend.entity.Ticket;

public interface TicketRepository extends JpaRepository<Ticket, String> {
    List<Ticket> findByBookingId(String bookingId);

    List<Ticket> findByShowtimeId(String showtimeId);

    List<Ticket> findBySeatId(String seatId);

    Optional<Ticket> findByShowtimeIdAndSeatId(String showtimeId, String seatId);

    boolean existsByShowtimeIdAndSeatId(String showtimeId, String seatId);
}
