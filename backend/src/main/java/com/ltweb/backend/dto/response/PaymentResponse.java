package com.ltweb.backend.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.ltweb.backend.enums.PaymentMethod;
import com.ltweb.backend.enums.PaymentStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentResponse {

    private String paymentId;

    private String bookingId;

    private PaymentMethod paymentMethod;

    private BigDecimal amount;

    private PaymentStatus paymentStatus;

    private String providerTxnId;

    private LocalDateTime paidAt;

    private LocalDateTime createdAt;
}
