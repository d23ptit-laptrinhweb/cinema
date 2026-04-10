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

    /** Trạng thái raw trong DB */
    private TicketStatus ticketStatus;

    /**
     * Trạng thái hiển thị cho frontend, kết hợp DB + Redis seat lock.
     * - AVAILABLE : ghế trống, có thể chọn
     * - HOLDING : đang bị khóa tạm thời bởi user khác (Redis)
     * - BOOKED : đã thanh toán thành công
     */
    private TicketStatus displayStatus;

    private String qrCode;
}
