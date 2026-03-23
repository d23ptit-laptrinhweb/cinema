package com.ltweb.backend.controller;

import java.util.List;

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
    public ApiResponse<PaymentResponse> createPayment(
        @RequestBody @Valid CreatePaymentRequest request
    ) {
        ApiResponse<PaymentResponse> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Payment created successfully!");
        apiResponse.setResult(paymentService.createPayment(request));
        return apiResponse;
    }

    @GetMapping
    public ApiResponse<List<PaymentResponse>> getAllPayments() {
        ApiResponse<List<PaymentResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(paymentService.getAllPayments());
        return apiResponse;
    }

    @GetMapping("/{id}")
    public ApiResponse<PaymentResponse> getPaymentById(
        @PathVariable("id") String id
    ) {
        ApiResponse<PaymentResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(paymentService.getPaymentById(id));
        return apiResponse;
    }

    @GetMapping("/booking/{bookingId}")
    public ApiResponse<List<PaymentResponse>> getPaymentsByBookingId(
        @PathVariable("bookingId") String bookingId
    ) {
        ApiResponse<List<PaymentResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(paymentService.getPaymentsByBookingId(bookingId));
        return apiResponse;
    }

    @PutMapping("/{id}")
    public ApiResponse<PaymentResponse> updatePayment(
        @PathVariable("id") String id,
        @RequestBody @Valid UpdatePaymentRequest request
    ) {
        ApiResponse<PaymentResponse> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Payment updated successfully!");
        apiResponse.setResult(paymentService.updatePayment(id, request));
        return apiResponse;
    }

    @PostMapping("/{id}/cancel")
    public ApiResponse<String> cancelPayment(
        @PathVariable("id") String id
    ) {
        paymentService.cancelPayment(id);
        ApiResponse<String> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Payment cancelled successfully!");
        return apiResponse;
    }
}
