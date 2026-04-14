package com.ltweb.backend.repository;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ltweb.backend.entity.Booking;
import com.ltweb.backend.enums.BookingStatus;

public interface BookingRepository extends JpaRepository<Booking, String> {
    List<Booking> findByUserId(String userId);

    Optional<Booking> findByBookingCode(String bookingCode);

    List<Booking> findByStatusAndExpiresAtBefore(BookingStatus status, LocalDateTime time);
}
