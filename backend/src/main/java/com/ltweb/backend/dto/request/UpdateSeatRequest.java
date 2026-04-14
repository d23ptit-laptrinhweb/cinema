package com.ltweb.backend.dto.request;

import com.ltweb.backend.enums.SeatType;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateSeatRequest {

    private String seatCode;

    private String rowLabel;

    private Integer seatNumber;

    private SeatType seatType;

    private Boolean isActive;

    private Long roomId;
}
