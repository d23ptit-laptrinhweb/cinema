package com.ltweb.backend.dto.request;

import java.time.LocalDateTime;

import com.ltweb.backend.enums.ShowtimeStatus;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateShowtimeRequest {
    private Long roomId;
    private String filmId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private ShowtimeStatus status;
}