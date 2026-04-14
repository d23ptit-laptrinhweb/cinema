package com.ltweb.backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ltweb.backend.entity.Showtime;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ShowtimeRepository extends JpaRepository<Showtime, String> {

    @EntityGraph(attributePaths = { "room", "film" })
    List<Showtime> findAll();

    @EntityGraph(attributePaths = { "room", "film" })
    List<Showtime> findByRoomId(Long roomId);

    @EntityGraph(attributePaths = { "room", "film" })
    List<Showtime> findByFilmId(String filmId);

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
            @Param("endTime") LocalDateTime endTime);

    @Query("""
                SELECT s FROM Showtime s
                WHERE s.room.branch.branchId = :branchId
                  AND s.startTime >= :startOfDay
                  AND s.startTime < :endOfDay
                ORDER BY s.film.filmName, s.startTime
            """)
    List<Showtime> findByBranchAndDate(
            @Param("branchId") String branchId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay);

    @Query("""
                SELECT COUNT(s) > 0
                FROM Showtime s
                WHERE s.room.id = :roomId
                  AND s.id != :excludeId
                  AND s.startTime < :endTime
                  AND s.endTime > :startTime
            """)
    boolean existsOverlappingShowtimeExcluding(
            @Param("roomId") Long roomId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("excludeId") String excludeId);

    boolean existsByRoomId(Long roomId);

}
