package com.ltweb.backend.dto.request;

import com.ltweb.backend.enums.BookingStatus;
import com.ltweb.backend.enums.PaymentMethod;
import com.ltweb.backend.enums.PaymentStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateBookingRequest {
    
    private BookingStatus status;

    private PaymentStatus paymentStatus;

    private PaymentMethod paymentMethod;

    private String providerTxnId;
}
