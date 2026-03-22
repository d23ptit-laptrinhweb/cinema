package com.ltweb.backend.dto.request;

import com.ltweb.backend.enums.PaymentStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePaymentRequest {
    
    private PaymentStatus paymentStatus;

    private String providerTxnId;
}
