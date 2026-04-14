package com.ltweb.backend.dto.request;

import com.ltweb.backend.enums.ShowtimeStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateShowtimeRequest {
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private ShowtimeStatus status;
}
