package com.ltweb.backend.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.ltweb.backend.enums.ShowtimeStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ShowtimeResponse {
    private String showtimeId;
    private Long roomId;
    private String filmId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BigDecimal basePrice;
    private ShowtimeStatus status;
}