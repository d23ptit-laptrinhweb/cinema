package com.ltweb.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.ltweb.backend.dto.request.CreatePaymentRequest;
import com.ltweb.backend.dto.request.UpdatePaymentRequest;
import com.ltweb.backend.dto.response.PaymentResponse;
import com.ltweb.backend.entity.Booking;
import com.ltweb.backend.entity.Payment;
import com.ltweb.backend.enums.PaymentStatus;
import com.ltweb.backend.exception.AppException;
import com.ltweb.backend.exception.ErrorCode;
import com.ltweb.backend.repository.BookingRepository;
import com.ltweb.backend.repository.PaymentRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;

    @Transactional
    public PaymentResponse createPayment(CreatePaymentRequest request) {
        // Get booking
        Booking booking = bookingRepository.findById(request.getBookingId())
            .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        // Create payment
        Payment payment = Payment.builder()
            .booking(booking)
            .paymentMethod(request.getPaymentMethod())
            .amount(request.getAmount())
            .paymentStatus(PaymentStatus.PENDING)
            .build();

        payment = paymentRepository.save(payment);

        log.info("Payment created for booking: {} with amount: {}", request.getBookingId(), request.getAmount());

        return toPaymentResponse(payment);
    }

    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll().stream()
            .map(this::toPaymentResponse)
            .toList();
    }

    public PaymentResponse getPaymentById(String paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
        return toPaymentResponse(payment);
    }

    public List<PaymentResponse> getPaymentsByBookingId(String bookingId) {
        // Verify booking exists
        bookingRepository.findById(bookingId)
            .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        return paymentRepository.findByBookingId(bookingId).stream()
            .map(this::toPaymentResponse)
            .toList();
    }

    @Transactional
    public PaymentResponse updatePayment(String paymentId, UpdatePaymentRequest request) {
        Payment payment = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        if (request.getPaymentStatus() != null) {
            payment.setPaymentStatus(request.getPaymentStatus());

            // If payment is successful, set paidAt timestamp
            if (request.getPaymentStatus() == PaymentStatus.PAID) {
                payment.setPaidAt(LocalDateTime.now());
            }
        }

        if (request.getProviderTxnId() != null) {
            payment.setProviderTxnId(request.getProviderTxnId());
        }

        payment = paymentRepository.save(payment);

        log.info("Payment updated: {} with status: {}", paymentId, request.getPaymentStatus());

        return toPaymentResponse(payment);
    }

    @Transactional
    public void refundPayment(String paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        if (payment.getPaymentStatus() != PaymentStatus.PAID) {
            throw new AppException(ErrorCode.INVALID_PAYMENT_STATUS);
        }

        payment.setPaymentStatus(PaymentStatus.REFUNDED);
        paymentRepository.save(payment);

        log.info("Payment refunded: {}", paymentId);
    }

    private PaymentResponse toPaymentResponse(Payment payment) {
        return PaymentResponse.builder()
            .paymentId(payment.getId())
            .bookingId(payment.getBooking().getId())
            .paymentMethod(payment.getPaymentMethod())
            .amount(payment.getAmount())
            .paymentStatus(payment.getPaymentStatus())
            .providerTxnId(payment.getProviderTxnId())
            .paidAt(payment.getPaidAt())
            .createdAt(payment.getCreatedAt())
            .build();
    }
}
