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

import com.ltweb.backend.dto.request.CreateBookingRequest;
import com.ltweb.backend.dto.request.UpdateBookingRequest;
import com.ltweb.backend.dto.response.ApiResponse;
import com.ltweb.backend.dto.response.BookingResponse;
import com.ltweb.backend.service.BookingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/booking")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ApiResponse<BookingResponse> createBooking(
        @RequestBody @Valid CreateBookingRequest request
    ) {
        ApiResponse<BookingResponse> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Booking created successfully!");
        apiResponse.setResult(bookingService.createBooking(request));
        return apiResponse;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<BookingResponse>> getAllBookings() {
        ApiResponse<List<BookingResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(bookingService.getAllBookings());
        return apiResponse;
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<BookingResponse> getBookingById(
        @PathVariable("id") String id
    ) {
        ApiResponse<BookingResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(bookingService.getBookingById(id));
        return apiResponse;
    }

    @GetMapping("/my-bookings/list")
    @PreAuthorize("hasRole('USER')")
    public ApiResponse<List<BookingResponse>> getMyBookingsList() {
        ApiResponse<List<BookingResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(bookingService.getMyBookingsList());
        return apiResponse;
    }

    @GetMapping("/my-bookings/{id}")
    @PreAuthorize("hasRole('USER')")
    public ApiResponse<BookingResponse> getMyBooking(
        @PathVariable("id") String id
    ) {
        ApiResponse<BookingResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(bookingService.getMyBookings(id));
        return apiResponse;
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<BookingResponse> updateBooking(
        @PathVariable("id") String id,
        @RequestBody @Valid UpdateBookingRequest request
    ) {
        ApiResponse<BookingResponse> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Booking updated successfully!");
        apiResponse.setResult(bookingService.updateBooking(id, request));
        return apiResponse;
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ApiResponse<String> cancelBooking(
        @PathVariable("id") String id
    ) {
        bookingService.cancelBooking(id);
        ApiResponse<String> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Booking cancelled successfully!");
        return apiResponse;
    }
}
