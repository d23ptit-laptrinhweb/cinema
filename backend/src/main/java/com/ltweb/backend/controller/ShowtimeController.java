// package com.ltweb.backend.controller;

// import java.util.List;

// import com.ltweb.backend.service.ShowtimeService;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// import com.ltweb.backend.dto.request.CreateShowtimeRequest;
// import com.ltweb.backend.dto.request.UpdateShowtimeRequest;
// import com.ltweb.backend.dto.response.ShowtimeResponse;

// import lombok.RequiredArgsConstructor;

// @RestController
// @RequestMapping("/showtime")
// @RequiredArgsConstructor
// public class ShowtimeController {

//     private final ShowtimeService showtimeService;

//     @PostMapping
//     public ShowtimeResponse create(@RequestBody CreateShowtimeRequest request) {
//         return showtimeService.create(request);
//     }

//     @PutMapping("/{id}")
//     public ShowtimeResponse update(
//         @PathVariable String id,
//         @RequestBody UpdateShowtimeRequest request
//     ) {
//         return showtimeService.update(id, request);
//     }

//     @DeleteMapping("/{id}")
//     public void delete(@PathVariable String id) {
//         showtimeService.delete(id);
//     }

//     @GetMapping("/{id}")
//     public ShowtimeResponse getById(@PathVariable String id) {
//         return showtimeService.getById(id);
//     }

//     @GetMapping("/room/{roomId}")
//     public List<ShowtimeResponse> getByRoom(@PathVariable Long roomId) {
//         return showtimeService.getByRoom(roomId);
//     }

//     @GetMapping("/film/{filmId}")
//     public List<ShowtimeResponse> getByFilm(@PathVariable String filmId) {
//         return showtimeService.getByFilm(filmId);
//     }
// }