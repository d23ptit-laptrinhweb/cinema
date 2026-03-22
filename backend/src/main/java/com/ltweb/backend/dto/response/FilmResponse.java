package com.ltweb.backend.dto.response;

import com.ltweb.backend.enums.AgeRating;
import com.ltweb.backend.enums.FilmStatus;
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
public class FilmResponse {
    private String filmId;
    private String filmName;
    private String description;
    private Integer durationMinutes;
    private AgeRating ageRating;
    private String language;
    private String subtitle;
    private String thumnbnail_url;
    private LocalDate releaseDate;
    private LocalDate endDate;
    private FilmStatus status;
    private Set<GenreResponse> genres;
}

