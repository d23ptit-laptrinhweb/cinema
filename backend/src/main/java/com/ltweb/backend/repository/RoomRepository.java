package com.ltweb.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ltweb.backend.entity.Room;
import com.ltweb.backend.enums.RoomStatus;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    @Query("select r from Room r where r.branch.branch_id = :branchId")
    List<Room> findByBranchId(@Param("branchId") String branchId);

    List<Room> findByStatus(RoomStatus status);

    @Query("select r from Room r where r.branch.branch_id = :branchId and r.status = :status")
    List<Room> findByBranchIdAndStatus(
        @Param("branchId") String branchId,
        @Param("status") RoomStatus status
    );
}
