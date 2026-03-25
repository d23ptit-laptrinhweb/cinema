package com.ltweb.backend.dto.request;

import java.math.BigDecimal;

import com.ltweb.backend.enums.SeatType;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateSeatTypePrice {
    private SeatType seatType;
    private BigDecimal price;
}
