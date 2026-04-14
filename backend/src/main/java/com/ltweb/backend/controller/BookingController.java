package com.ltweb.backend.controller;

import java.util.List;
import java.time.LocalDate;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ltweb.backend.dto.request.CreateBookingRequest;
import com.ltweb.backend.dto.request.UpdateBookingRequest;
import com.ltweb.backend.dto.response.ApiResponse;
import com.ltweb.backend.dto.response.BookingResponse;
import com.ltweb.backend.dto.response.PageResponse;
import com.ltweb.backend.service.BookingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/booking")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ApiResponse<BookingResponse> createBooking(
        @RequestBody @Valid CreateBookingRequest request
    ) {
        ApiResponse<BookingResponse> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Booking created successfully!");
        apiResponse.setResult(bookingService.createBooking(request));
        return apiResponse;
    }

    @GetMapping
    public ApiResponse<PageResponse<List<BookingResponse>>> getAllBookings(
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
        @RequestParam(required = false) String bookingCode
    ) {
        int pageIndex = Math.max(page - 1, 0);
        Sort sort = Sort.by("createdAt").descending();
        Pageable pageable = PageRequest.of(pageIndex, size, sort);

        ApiResponse<PageResponse<List<BookingResponse>>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(bookingService.getAllBookings(date, bookingCode, pageable));
        return apiResponse;
    }

    @GetMapping("/{id}")
    public ApiResponse<BookingResponse> getBookingById(
        @PathVariable("id") String id
    ) {
        ApiResponse<BookingResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(bookingService.getBookingById(id));
        return apiResponse;
    }

    @GetMapping("/my-bookings/list")
    public ApiResponse<List<BookingResponse>> getMyBookingsList() {
        ApiResponse<List<BookingResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(bookingService.getMyBookingsList());
        return apiResponse;
    }

    @GetMapping("/my-bookings/{id}")
    public ApiResponse<BookingResponse> getMyBooking(
        @PathVariable("id") String id
    ) {
        ApiResponse<BookingResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(bookingService.getMyBookings(id));
        return apiResponse;
    }

    @PutMapping("/{id}")
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
    public ApiResponse<String> cancelBooking(
        @PathVariable("id") String id
    ) {
        bookingService.cancelBooking(id);
        ApiResponse<String> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Booking cancelled successfully!");
        return apiResponse;
    }
}
