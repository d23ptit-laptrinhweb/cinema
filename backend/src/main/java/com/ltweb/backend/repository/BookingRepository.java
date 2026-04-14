package com.ltweb.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ltweb.backend.entity.Booking;
import com.ltweb.backend.enums.BookingStatus;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {

    @EntityGraph(attributePaths = { "user", "showtime", "showtime.film", "showtime.room", "showtime.room.branch" })
    List<Booking> findAll();

    @EntityGraph(attributePaths = { "user", "showtime", "showtime.film", "showtime.room", "showtime.room.branch" })
    Optional<Booking> findById(String id);

    List<Booking> findByUserId(String userId);

    Optional<Booking> findByBookingCode(String bookingCode);

    List<Booking> findByStatusAndExpiresAtBefore(BookingStatus status, LocalDateTime time);

    List<Booking> findByShowtimeIdAndStatus(String showtimeId, BookingStatus status);
}
