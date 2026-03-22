package com.ltweb.backend.dto.response;

import java.math.BigDecimal;

import com.ltweb.backend.enums.TicketStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TicketResponse {

    private String ticketId;

    private String bookingId;

    private String showtimeId;

    private String seatId;

    private BigDecimal price;

    private TicketStatus ticketStatus;

    private String qrCode;
}
