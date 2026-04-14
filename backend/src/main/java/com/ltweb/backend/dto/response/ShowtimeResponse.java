package com.ltweb.backend.dto.response;

import java.time.LocalDateTime;

import com.ltweb.backend.enums.ShowtimeStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ShowtimeResponse {
    private String showtimeId;
    private Long roomId;
    private String roomName;
    private String roomType;
    private String branchName;
    private String branchId;
    private String filmId;
    private String filmName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private ShowtimeStatus status;
}
