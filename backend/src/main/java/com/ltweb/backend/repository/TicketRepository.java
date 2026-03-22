package com.ltweb.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ltweb.backend.entity.Ticket;

public interface TicketRepository extends JpaRepository<Ticket, String> {
    List<Ticket> findByBookingBooking_id(String bookingId);

    List<Ticket> findByShowtimeShowtimeId(String showtimeId);

    List<Ticket> findBySeatSeatId(String seatId);

    Optional<Ticket> findByShowtimeShowtimeIdAndSeatSeatId(String showtimeId, String seatId);

    boolean existsByShowtimeShowtimeIdAndSeatSeatId(String showtimeId, String seatId);
}
