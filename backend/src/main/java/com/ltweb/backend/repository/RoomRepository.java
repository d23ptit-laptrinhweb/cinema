package com.ltweb.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ltweb.backend.entity.Room;
import com.ltweb.backend.enums.RoomStatus;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    @EntityGraph(attributePaths = { "branch" })
    Optional<Room> findById(Long id);

    @EntityGraph(attributePaths = { "branch" })
    @Query("select r from Room r where " +
            "(:branchId is null or r.branch.branchId =:branchId) " +
            "and (:status is null or r.status =:status)")
    List<Room> findByBranchIdAndStatus(
        @Param("branchId") String branchId,
        @Param("status") RoomStatus status
    );
}
