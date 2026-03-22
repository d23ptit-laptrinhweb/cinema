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

import com.ltweb.backend.dto.request.CreatePaymentRequest;
import com.ltweb.backend.dto.request.UpdatePaymentRequest;
import com.ltweb.backend.dto.response.ApiResponse;
import com.ltweb.backend.dto.response.PaymentResponse;
import com.ltweb.backend.service.PaymentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ApiResponse<PaymentResponse> createPayment(
        @RequestBody @Valid CreatePaymentRequest request
    ) {
        ApiResponse<PaymentResponse> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Payment created successfully!");
        apiResponse.setResult(paymentService.createPayment(request));
        return apiResponse;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<PaymentResponse>> getAllPayments() {
        ApiResponse<List<PaymentResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(paymentService.getAllPayments());
        return apiResponse;
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<PaymentResponse> getPaymentById(
        @PathVariable("id") String id
    ) {
        ApiResponse<PaymentResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(paymentService.getPaymentById(id));
        return apiResponse;
    }

    @GetMapping("/booking/{bookingId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ApiResponse<List<PaymentResponse>> getPaymentsByBookingId(
        @PathVariable("bookingId") String bookingId
    ) {
        ApiResponse<List<PaymentResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(paymentService.getPaymentsByBookingId(bookingId));
        return apiResponse;
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<PaymentResponse> updatePayment(
        @PathVariable("id") String id,
        @RequestBody @Valid UpdatePaymentRequest request
    ) {
        ApiResponse<PaymentResponse> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Payment updated successfully!");
        apiResponse.setResult(paymentService.updatePayment(id, request));
        return apiResponse;
    }

    @PostMapping("/{id}/refund")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> refundPayment(
        @PathVariable("id") String id
    ) {
        paymentService.refundPayment(id);
        ApiResponse<String> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Payment refunded successfully!");
        return apiResponse;
    }
}
