package com.ltweb.backend.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.ltweb.backend.enums.BookingStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BookingResponse {

    private String bookingId;

    private String bookingCode;

    private String userId;

    private String showtimeId;

    private BigDecimal totalAmount;

    private BookingStatus status;

    private LocalDateTime expiresAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private List<TicketResponse> tickets;

    private PaymentResponse payment;
}
