package com.ltweb.backend.dto.request;

import com.ltweb.backend.enums.AgeRating;
import com.ltweb.backend.enums.FilmStatus;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateFilmRequest {
    @Size(max = 255, message = "Film name must be at most 255 characters")
    private String filmName;

    @Size(max = 5000, message = "Description must be at most 5000 characters")
    private String description;

    private Integer durationMinutes;

    private AgeRating ageRating;

    @Size(max = 100, message = "Language must be at most 100 characters")
    private String language;

    @Size(max = 100, message = "Subtitle must be at most 100 characters")
    private String subtitle;

    @Size(max = 500, message = "Thumbnail URL must be at most 500 characters")
    private String thumnbnail_url;

    private LocalDate releaseDate;

    private LocalDate endDate;

    private FilmStatus status;

    private Set<Long> genreIds;
}

