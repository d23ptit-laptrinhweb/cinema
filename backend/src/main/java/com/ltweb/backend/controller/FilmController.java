package com.ltweb.backend.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ltweb.backend.dto.request.CreateFilmRequest;
import com.ltweb.backend.dto.request.UpdateFilmRequest;
import com.ltweb.backend.dto.response.ApiResponse;
import com.ltweb.backend.dto.response.FilmResponse;
import com.ltweb.backend.service.FilmService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/film")
@RequiredArgsConstructor
public class FilmController {
    private final FilmService filmService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<FilmResponse> createFilm(@RequestBody @Valid CreateFilmRequest createFilmRequest) {
        ApiResponse<FilmResponse> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Create film successfully!");
        apiResponse.setResult(filmService.createFilm(createFilmRequest));
        return apiResponse;
    }

    @GetMapping
    public ApiResponse<List<FilmResponse>> getAllFilms(@org.springframework.web.bind.annotation.RequestParam(required = false) String filmName) {
        ApiResponse<List<FilmResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(filmService.getAllFilms(filmName));
        return apiResponse;
    }

    @GetMapping("/upcoming")
    public ApiResponse<List<FilmResponse>> getUpcomingFilms() {
        ApiResponse<List<FilmResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(filmService.getUpcomingFilms());
        return apiResponse;
    }

    @GetMapping("/now-showing")
    public ApiResponse<List<FilmResponse>> getNowShowingFilms() {
        ApiResponse<List<FilmResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(filmService.getNowShowingFilms());
        return apiResponse;
    }

    @GetMapping("/{id}")
    public ApiResponse<FilmResponse> getFilmById(@PathVariable("id") String id) {
        ApiResponse<FilmResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(filmService.getFilmById(id));
        return apiResponse;
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<FilmResponse> updateFilm(
        @PathVariable("id") String id,
        @RequestBody @Valid UpdateFilmRequest updateFilmRequest
    ) {
        ApiResponse<FilmResponse> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Film has been updated successfully!");
        apiResponse.setResult(filmService.updateFilm(id, updateFilmRequest));
        return apiResponse;
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> deleteFilm(@PathVariable("id") String id) {
        ApiResponse<String> apiResponse = new ApiResponse<>();
        filmService.deleteFilm(id);
        apiResponse.setMessage("Film has been deleted successfully!");
        return apiResponse;
    }
}

