package com.ltweb.backend.dto.response;

import java.math.BigDecimal;

import com.ltweb.backend.enums.TicketStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TicketResponse {

    private String id;

    private BigDecimal price;

    /** Trạng thái raw trong DB */
    private TicketStatus ticketStatus;

    private String showtimeId;

    private String seatId;

    private String bookingId;

    // đặc điểm của ghế
    private String seatCode;

    private String rowLabel;

    private Integer seatNumber;

    /**
     * Trạng thái hiển thị cho frontend, kết hợp DB + Redis seat lock.
     * - AVAILABLE : ghế trống, có thể chọn
     * - HOLDING : đang bị khóa tạm thời bởi user khác (Redis)
     * - BOOKED : đã thanh toán thành công
     */
    private TicketStatus displayStatus;

    private String qrCode;
}
