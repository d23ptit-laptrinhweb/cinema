package com.ltweb.backend.entity;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import com.ltweb.backend.enums.AgeRating;
import com.ltweb.backend.enums.FilmStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "films")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Film {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "film_id")
    private String id;

    @Column(nullable = false,name = "film_name")
    private String filmName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Column(name = "trailer_url")
    private String trailerUrl;

    private Integer durationMinutes;

    @Enumerated(EnumType.STRING)
    private AgeRating ageRating;

    private String language;

    private String subtitle;

    private LocalDate releaseDate;

    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    private FilmStatus status;

    @ManyToMany
    @JoinTable(
        name = "film_genres",
        joinColumns = @JoinColumn(name = "film_id"),
        inverseJoinColumns = @JoinColumn(name = "genre_id")
    )
    @Builder.Default
    private Set<Genre> genres = new HashSet<>();
}
