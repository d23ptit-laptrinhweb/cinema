package com.ltweb.backend.repository;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ltweb.backend.entity.Booking;
import com.ltweb.backend.enums.BookingStatus;

public interface BookingRepository extends JpaRepository<Booking, String> {
    List<Booking> findByUserId(String userId);

    Optional<Booking> findByBookingCode(String bookingCode);

    @Query("""
        SELECT b
        FROM Booking b
        WHERE (:bookingCode IS NULL OR LOWER(b.bookingCode) LIKE LOWER(CONCAT('%', :bookingCode, '%')))
          AND (:startOfDay IS NULL OR (b.createdAt >= :startOfDay AND b.createdAt < :endOfDay))
    """)
    Page<Booking> searchBookings(
            @Param("bookingCode") String bookingCode,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay,
            Pageable pageable
    );

    List<Booking> findByStatusAndExpiresAtBefore(BookingStatus status, LocalDateTime time);
}
