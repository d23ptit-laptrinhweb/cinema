package com.ltweb.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ltweb.backend.entity.Payment;

public interface PaymentRepository extends JpaRepository<Payment, String> {
    List<Payment> findByBookingId(String bookingId);
}
