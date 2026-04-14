package com.ltweb.backend.service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.ltweb.backend.mapper.FilmMapper;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import com.ltweb.backend.dto.request.CreateFilmRequest;
import com.ltweb.backend.dto.request.UpdateFilmRequest;
import com.ltweb.backend.dto.response.FilmResponse;
import com.ltweb.backend.entity.Film;
import com.ltweb.backend.entity.Genre;
import com.ltweb.backend.enums.FilmStatus;
import com.ltweb.backend.exception.AppException;
import com.ltweb.backend.exception.ErrorCode;
import com.ltweb.backend.repository.FilmRepository;
import com.ltweb.backend.repository.GenreRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FilmService {
    private final FilmRepository filmRepository;
    private final GenreRepository genreRepository;
    private final FilmMapper filmMapper;

    @Transactional
    public FilmResponse createFilm(CreateFilmRequest createFilmRequest) {
        Film film = filmMapper.toFilm(createFilmRequest);

        if (createFilmRequest.getGenreIds() != null && !createFilmRequest.getGenreIds().isEmpty()) {
            Set<Genre> genres = new HashSet<>(genreRepository.findAllById(createFilmRequest.getGenreIds()));
            film.setGenres(genres);
        }

        return filmMapper.toFilmResponse(filmRepository.save(film));
    }

    @Transactional(readOnly = true)
    public List<FilmResponse> getAllFilms(String filmName) {
        List<Film> films;
        if (filmName != null && !filmName.isBlank()) {
            films = filmRepository.findByFilmNameContainingIgnoreCase(filmName);
        } else {
            films = filmRepository.findAll();
        }
        return films.stream()
            .map(filmMapper::toFilmResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<FilmResponse> getUpcomingFilms() {
        return filmRepository.findByStatus(FilmStatus.UPCOMING).stream()
            .map(filmMapper::toFilmResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<FilmResponse> getNowShowingFilms() {
        return filmRepository.findByStatus(FilmStatus.NOW_SHOWING).stream()
            .map(filmMapper::toFilmResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public FilmResponse getFilmById(String filmId) {
        Film film = getFilm(filmId);
        return filmMapper.toFilmResponse(film);
    }

    @Transactional
    public FilmResponse updateFilm(String filmId, UpdateFilmRequest request) {
        Film film = getFilm(filmId);

        filmMapper.updateFilm(film, request);
        if (request.getGenreIds() != null && !request.getGenreIds().isEmpty()) {
            Set<Genre> genres = new HashSet<>(genreRepository.findAllById(request.getGenreIds()));
            film.setGenres(genres);
        }
        return filmMapper.toFilmResponse(filmRepository.save(film));
    }

    @Transactional
    public void deleteFilm(String filmId) {
        Film film = getFilm(filmId);
        filmRepository.delete(film);
    }

    // ===== PRIVATE HELPER =====
    private Film getFilm(String filmId) {
        return filmRepository.findById(filmId)
                .orElseThrow(() -> new AppException(ErrorCode.FILM_NOT_FOUND));
    }
}

