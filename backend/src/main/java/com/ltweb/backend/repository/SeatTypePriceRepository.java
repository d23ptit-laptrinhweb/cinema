package com.ltweb.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ltweb.backend.entity.SeatTypePrice;
import com.ltweb.backend.enums.SeatType;

public interface SeatTypePriceRepository extends JpaRepository<SeatTypePrice, SeatType> {
    Optional<SeatTypePrice> findBySeatType(SeatType seatType);
}