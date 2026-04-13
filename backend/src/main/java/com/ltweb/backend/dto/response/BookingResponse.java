package com.ltweb.backend.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.ltweb.backend.enums.BookingStatus;
import com.ltweb.backend.enums.PaymentMethod;
import com.ltweb.backend.enums.PaymentStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BookingResponse {

    private String bookingId;

    private String bookingCode;

    private String userId;

    private String showtimeId;

    // chi tiết xuất chiếu để hiển thị
    private String filmName;
    private String filmThumbnailUrl;
    private String roomName;
    private String branchName;
    private LocalDateTime showtimeStart;
    private LocalDateTime showtimeEnd;

    // Seat codes
    private List<String> seatCodes;

    private BigDecimal totalAmount;

    private BookingStatus status;

    private LocalDateTime expiresAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private PaymentMethod paymentMethod;

    private PaymentStatus paymentStatus;

    private String providerTxnId;

    private LocalDateTime paidAt;

    private LocalDateTime paymentCreatedAt;

    private List<TicketResponse> tickets;
}
