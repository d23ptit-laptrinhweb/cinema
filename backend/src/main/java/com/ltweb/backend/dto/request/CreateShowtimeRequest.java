package com.ltweb.backend.dto.request;

import java.time.LocalDateTime;

import com.ltweb.backend.enums.ShowtimeStatus;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateShowtimeRequest {
    @NotNull(message = "Room ID is required")
    private Long roomId;

    @NotBlank(message = "Film ID is required")
    private String filmId;

    @NotNull(message = "Start time is required")
    @Future(message = "Start time must be in the future")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    @Future(message = "End time must be in the future")
    private LocalDateTime endTime;

    @NotNull(message = "Status is required")
    private ShowtimeStatus status;
}

