package com.ltweb.backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ltweb.backend.entity.Showtime;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ShowtimeRepository extends JpaRepository<Showtime, String> {

    @EntityGraph(attributePaths = {"room.branch", "film"})
    List<Showtime> findByRoomId(Long roomId);

    @EntityGraph(attributePaths = {"film", "room.branch"})
    List<Showtime> findByFilmId(String filmId);

    @EntityGraph(attributePaths = {"room.branch", "film"})
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
            @Param("endTime") LocalDateTime endTime);

    @EntityGraph(attributePaths = {"room.branch", "film"})
    @Query("""
                SELECT s FROM Showtime s
                  WHERE s.room.branch.branch_id = :branchId
                  AND s.startTime >= :startOfDay
                  AND s.startTime < :endOfDay
                ORDER BY s.film.filmName, s.startTime
            """)
    List<Showtime> findByBranchAndDate(
            @Param("branchId") String branchId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay);

    @EntityGraph(attributePaths = {"room.branch", "film"})
    @Query("""
                SELECT s FROM Showtime s
                WHERE s.film.id = :filmId
                 AND s.room.branch.branch_id = :branchId
                  AND s.startTime >= :startOfDay
                  AND s.startTime < :endOfDay
                ORDER BY s.startTime
            """)
    List<Showtime> findByFilmAndDateAndBranch(
            @Param("filmId") String filmId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay,
            @Param("branchId") String branchId);

}
