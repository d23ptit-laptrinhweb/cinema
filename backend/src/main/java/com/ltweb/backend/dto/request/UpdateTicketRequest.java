package com.ltweb.backend.dto.request;

import java.math.BigDecimal;

import com.ltweb.backend.enums.TicketStatus;

import lombok.Data;

@Data
public class UpdateTicketRequest {

    private String bookingId;

    private String showtimeId;

    private String seatId;

    private BigDecimal price;

    private TicketStatus ticketStatus;

    private String qrCode;
}
