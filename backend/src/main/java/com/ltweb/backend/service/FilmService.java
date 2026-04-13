package com.ltweb.backend.service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import com.ltweb.backend.dto.request.CreateFilmRequest;
import com.ltweb.backend.dto.request.UpdateFilmRequest;
import com.ltweb.backend.dto.response.FilmResponse;
import com.ltweb.backend.dto.response.GenreResponse;
import com.ltweb.backend.entity.Film;
import com.ltweb.backend.entity.Genre;
import com.ltweb.backend.enums.FilmStatus;
import com.ltweb.backend.exception.AppException;
import com.ltweb.backend.exception.ErrorCode;
import com.ltweb.backend.repository.FilmRepository;
import com.ltweb.backend.repository.GenreRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FilmService {
    private final FilmRepository filmRepository;
    private final GenreRepository genreRepository;

    @PreAuthorize("hasRole('ADMIN')")
    public FilmResponse createFilm(CreateFilmRequest createFilmRequest) {
        Film film = Film.builder()
            .filmName(createFilmRequest.getFilmName())
            .description(createFilmRequest.getDescription())
            .durationMinutes(createFilmRequest.getDurationMinutes())
            .ageRating(createFilmRequest.getAgeRating())
            .language(createFilmRequest.getLanguage())
            .subtitle(createFilmRequest.getSubtitle())
            .thumbnailUrl(createFilmRequest.getThumbnailUrl())
            .trailerUrl(createFilmRequest.getTrailerUrl())
            .releaseDate(createFilmRequest.getReleaseDate())
            .endDate(createFilmRequest.getEndDate())
            .status(createFilmRequest.getStatus())
            .build();

        if (createFilmRequest.getGenreIds() != null && !createFilmRequest.getGenreIds().isEmpty()) {
            Set<Genre> genres = genreRepository.findAllById(createFilmRequest.getGenreIds())
                .stream()
                .collect(Collectors.toSet());
            film.setGenres(genres);
        }

        return toFilmResponse(filmRepository.save(film));
    }

    public List<FilmResponse> getAllFilms() {
        return filmRepository.findAll().stream()
            .map(this::toFilmResponse)
            .toList();
    }

    public List<FilmResponse> getUpcomingFilms() {
        return filmRepository.findByStatus(FilmStatus.UPCOMING).stream()
            .map(this::toFilmResponse)
            .toList();
    }

    public List<FilmResponse> getNowShowingFilms() {
        return filmRepository.findByStatus(FilmStatus.NOW_SHOWING).stream()
            .map(this::toFilmResponse)
            .toList();
    }

    public FilmResponse getFilmById(String filmId) {
        Film film = filmRepository.findById(filmId)
            .orElseThrow(() -> new AppException(ErrorCode.FILM_NOT_FOUND));
        return toFilmResponse(film);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public FilmResponse updateFilm(String filmId, UpdateFilmRequest request) {
        Film film = filmRepository.findById(filmId)
            .orElseThrow(() -> new AppException(ErrorCode.FILM_NOT_FOUND));

        if (request.getFilmName() != null && !request.getFilmName().isBlank()) {
            film.setFilmName(request.getFilmName());
        }
        if (request.getDescription() != null) {
            film.setDescription(request.getDescription());
        }
        if (request.getDurationMinutes() != null) {
            film.setDurationMinutes(request.getDurationMinutes());
        }
        if (request.getAgeRating() != null) {
            film.setAgeRating(request.getAgeRating());
        }
        if (request.getLanguage() != null) {
            film.setLanguage(request.getLanguage());
        }
        if (request.getSubtitle() != null) {
            film.setSubtitle(request.getSubtitle());
        }
        if (request.getThumbnailUrl() != null) {
            film.setThumbnailUrl(request.getThumbnailUrl());
        }
        if (request.getTrailerUrl() != null) {
            film.setTrailerUrl(request.getTrailerUrl());
        }
        if (request.getReleaseDate() != null) {
            film.setReleaseDate(request.getReleaseDate());
        }
        if (request.getEndDate() != null) {
            film.setEndDate(request.getEndDate());
        }
        if (request.getStatus() != null) {
            film.setStatus(request.getStatus());
        }
        if (request.getGenreIds() != null && !request.getGenreIds().isEmpty()) {
            Set<Genre> genres = genreRepository.findAllById(request.getGenreIds())
                .stream()
                .collect(Collectors.toSet());
            film.setGenres(genres);
        }

        return toFilmResponse(filmRepository.save(film));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteFilm(String filmId) {
        Film film = filmRepository.findById(filmId)
            .orElseThrow(() -> new AppException(ErrorCode.FILM_NOT_FOUND));
        filmRepository.delete(film);
    }

    private FilmResponse toFilmResponse(Film film) {
        Set<GenreResponse> genreResponses = film.getGenres().stream()
            .map(genre -> GenreResponse.builder()
                .id(genre.getId())
                .name(genre.getName())
                .build())
            .collect(Collectors.toSet());

        return FilmResponse.builder()
            .filmId(film.getId())
            .filmName(film.getFilmName())
            .description(film.getDescription())
            .durationMinutes(film.getDurationMinutes())
            .ageRating(film.getAgeRating())
            .language(film.getLanguage())
            .subtitle(film.getSubtitle())
            .thumbnailUrl(film.getThumbnailUrl())
            .trailerUrl(film.getTrailerUrl())
            .releaseDate(film.getReleaseDate())
            .endDate(film.getEndDate())
            .status(film.getStatus())
            .genres(genreResponses)
            .build();
    }
}

