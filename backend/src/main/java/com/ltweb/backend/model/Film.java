package com.ltweb.backend.model;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import com.ltweb.backend.enums.AgeRating;
import com.ltweb.backend.enums.FilmStatus;

import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
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
    private String film_id;

    @Column(nullable = false)
    private String film_name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Integer durationMinutes;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AgeRating ageRating = AgeRating.P;

    private String language;

    private String subtitle;

    private LocalDate releaseDate;

    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private FilmStatus status = FilmStatus.UPCOMING;

    @OneToMany(mappedBy = "film", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<Showtime> showtimes = new HashSet<>();

    @ManyToMany
    @JoinTable(
        name = "film_genres",
        joinColumns = @JoinColumn(name = "film_id"),
        inverseJoinColumns = @JoinColumn(name = "genre_id")
    )
    @Builder.Default
    private Set<Genre> genres = new HashSet<>();
}
