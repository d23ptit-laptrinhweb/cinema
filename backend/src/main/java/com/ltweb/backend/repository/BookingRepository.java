package com.ltweb.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ltweb.backend.entity.Booking;

public interface BookingRepository extends JpaRepository<Booking, String> {
}
