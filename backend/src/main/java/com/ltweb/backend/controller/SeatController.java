package com.ltweb.backend.controller;

import java.util.List;

import com.ltweb.backend.dto.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ltweb.backend.dto.request.CreateSeatRequest;
import com.ltweb.backend.dto.request.UpdateSeatRequest;
import com.ltweb.backend.dto.response.SeatResponse;


import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/seats")
@RequiredArgsConstructor
public class SeatController {

    private final com.ltweb.backend.service.impl.SeatService seatService;

    @PostMapping
    public ResponseEntity<SeatResponse> create(@RequestBody CreateSeatRequest request) {
        SeatResponse seat = seatService.createSeat(request);
        return ResponseEntity.ok(seat);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SeatResponse> update(
        @PathVariable String id,
        @RequestBody UpdateSeatRequest request
    ) {
        SeatResponse seat = seatService.updateSeat(id, request);
        return ResponseEntity.ok(seat);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        seatService.deleteSeat(id);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SeatResponse> getById(@PathVariable String id) {
        SeatResponse seat = seatService.getSeatById(id);
        return ResponseEntity.ok(seat);
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<SeatResponse>> getByRoom(@PathVariable String roomId) {
        List<SeatResponse> seat = seatService.getSeatsByRoom(roomId);
        return ResponseEntity.ok(seat);t
    }
}