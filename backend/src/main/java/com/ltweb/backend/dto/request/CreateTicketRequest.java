package com.ltweb.backend.dto.request;

import java.math.BigDecimal;

import com.ltweb.backend.enums.TicketStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateTicketRequest {

    @NotBlank
    private String bookingId;

    @NotBlank
    private String showtimeId;

    @NotBlank
    private String seatId;

    @NotNull
    private BigDecimal price;

    @NotNull
    private TicketStatus ticketStatus;

    private String qrCode;
}
