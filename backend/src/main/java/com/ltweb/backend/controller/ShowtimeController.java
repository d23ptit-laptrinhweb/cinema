package com.ltweb.backend.controller;

import java.util.List;

import com.ltweb.backend.service.ShowtimeService;
import org.springframework.web.bind.annotation.*;

import com.ltweb.backend.dto.request.CreateShowtimeRequest;
import com.ltweb.backend.dto.request.UpdateShowtimeRequest;
import com.ltweb.backend.dto.response.ApiResponse;
import com.ltweb.backend.dto.response.ShowtimeResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/showtime")
@RequiredArgsConstructor
public class ShowtimeController {

    private final ShowtimeService showtimeService;

    @PostMapping
    public ApiResponse<ShowtimeResponse> create(@RequestBody CreateShowtimeRequest request) {
        ApiResponse<ShowtimeResponse> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Create showtime successfully!");
        apiResponse.setResult(showtimeService.create(request));
        return apiResponse;
    }

    @PutMapping("/{id}")
    public ApiResponse<ShowtimeResponse> update(
        @PathVariable String id,
        @RequestBody UpdateShowtimeRequest request
    ) {
        ApiResponse<ShowtimeResponse> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Showtime has been updated successfully!");
        apiResponse.setResult(showtimeService.update(id, request));
        return apiResponse;
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> delete(@PathVariable String id) {
        ApiResponse<String> apiResponse = new ApiResponse<>();
        showtimeService.delete(id);
        apiResponse.setMessage("Showtime has been deleted successfully!");
        return apiResponse;
    }

    @GetMapping("/{id}")
    public ApiResponse<ShowtimeResponse> getById(@PathVariable String id) {
        ApiResponse<ShowtimeResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(showtimeService.getById(id));
        return apiResponse;
    }

    @GetMapping("/room/{roomId}")
    public ApiResponse<List<ShowtimeResponse>> getByRoom(@PathVariable Long roomId) {
        ApiResponse<List<ShowtimeResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(showtimeService.getByRoom(roomId));
        return apiResponse;
    }

    @GetMapping("/film/{filmId}")
    public ApiResponse<List<ShowtimeResponse>> getByFilm(@PathVariable String filmId) {
        ApiResponse<List<ShowtimeResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(showtimeService.getByFilm(filmId));
        return apiResponse;
    }
}