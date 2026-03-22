package com.ltweb.backend.dto.request;

import com.ltweb.backend.enums.SeatType;

import lombok.Data;

@Data
public class CreateSeatRequest {

    private String roomId;

    private String seatCode;

    private String rowLabel;

    private Integer seatNumber;

    private SeatType seatType;

    private Boolean isActive;
}