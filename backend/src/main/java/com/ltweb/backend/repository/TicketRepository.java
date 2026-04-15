package com.ltweb.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ltweb.backend.entity.Ticket;

public interface TicketRepository extends JpaRepository<Ticket, String> {
    @EntityGraph(attributePaths = {"booking.user", "showtime.film", "showtime.room.branch", "seat"})
    List<Ticket> findByBookingId(String bookingId);

    @EntityGraph(attributePaths = {"showtime.film", "showtime.room.branch", "seat", "booking.user"})
    List<Ticket> findByShowtimeId(String showtimeId);

    @EntityGraph(attributePaths = {"showtime.film", "showtime.room.branch", "seat", "booking.user"})
    List<Ticket> findBySeatId(String seatId);

    @EntityGraph(attributePaths = {"showtime.film", "showtime.room.branch", "seat", "booking.user"})
    Optional<Ticket> findByShowtimeIdAndSeatId(String showtimeId, String seatId);

    boolean existsByShowtimeIdAndSeatId(String showtimeId, String seatId);
}
