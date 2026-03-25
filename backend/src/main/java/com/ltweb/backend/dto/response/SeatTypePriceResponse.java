package com.ltweb.backend.dto.response;

import java.math.BigDecimal;

import com.ltweb.backend.enums.SeatType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatTypePriceResponse {
    private SeatType seatType;
    private BigDecimal price;
}
