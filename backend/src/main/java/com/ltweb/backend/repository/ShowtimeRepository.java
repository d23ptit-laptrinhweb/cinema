package com.ltweb.backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ltweb.backend.entity.Showtime;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ShowtimeRepository extends JpaRepository<Showtime, String> {

    List<Showtime> findByRoomId(Long roomId);

    List<Showtime> findByFilmId(String filmId);

    List<Showtime> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);

    @Query("""
        SELECT COUNT(s) > 0
        FROM Showtime s
        WHERE s.room.id = :roomId
          AND s.startTime < :endTime
          AND s.endTime > :startTime
    """)
    boolean existsOverlappingShowtime(
            @Param("roomId") Long roomId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );
    
}