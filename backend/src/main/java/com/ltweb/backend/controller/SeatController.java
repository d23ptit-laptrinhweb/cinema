package com.ltweb.backend.controller;

import java.util.List;

import com.ltweb.backend.service.SeatService;
import org.springframework.web.bind.annotation.*;

import com.ltweb.backend.dto.request.CreateSeatRequest;
import com.ltweb.backend.dto.request.UpdateSeatRequest;
import com.ltweb.backend.dto.response.ApiResponse;
import com.ltweb.backend.dto.response.SeatResponse;


import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/seat")
@RequiredArgsConstructor
public class SeatController {

    private final SeatService seatService;

    @PostMapping
    public ApiResponse<SeatResponse> create(@RequestBody CreateSeatRequest request) {
        ApiResponse<SeatResponse> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Create seat successfully!");
        apiResponse.setResult(seatService.createSeat(request));
        return apiResponse;
    }

    @GetMapping
    public ApiResponse<List<SeatResponse>> getAll() {
        ApiResponse<List<SeatResponse>> apiResponse = new ApiResponse<>();
        //apiResponse.setResult(seatService.getSeatsByRoom());
        return apiResponse;
    }

    @PutMapping("/{id}")
    public ApiResponse<SeatResponse> update(
        @PathVariable String id,
        @RequestBody UpdateSeatRequest request
    ) {
        ApiResponse<SeatResponse> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Seat has been updated successfully!");
        apiResponse.setResult(seatService.updateSeat(id, request));
        return apiResponse;
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> delete(@PathVariable String id) {
        ApiResponse<String> apiResponse = new ApiResponse<>();
        seatService.deleteSeat(id);
        apiResponse.setMessage("Seat has been deleted successfully!");
        return apiResponse;
    }

    @GetMapping("/{id}")
    public ApiResponse<SeatResponse> getById(@PathVariable String id) {
        ApiResponse<SeatResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(seatService.getSeatById(id));
        return apiResponse;
    }

    @GetMapping("/room/{roomId}")
    public ApiResponse<List<SeatResponse>> getByRoom(@PathVariable Long roomId) {
        ApiResponse<List<SeatResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(seatService.getSeatsByRoom(roomId));
        return apiResponse;
    }
}