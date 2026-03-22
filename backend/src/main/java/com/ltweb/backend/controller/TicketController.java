package com.ltweb.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ltweb.backend.dto.request.UpdateTicketRequest;
import com.ltweb.backend.dto.response.ApiResponse;
import com.ltweb.backend.dto.response.TicketResponse;
import com.ltweb.backend.service.TicketService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/ticket")
@RequiredArgsConstructor
public class TicketController {
    private final TicketService ticketService;

    @GetMapping
    public ApiResponse<List<TicketResponse>> getAllTickets() {
        ApiResponse<List<TicketResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(ticketService.getAllTickets());
        return apiResponse;
    }

    @GetMapping("/{id}")
    public ApiResponse<TicketResponse> getTicketById(@PathVariable("id") String id) {
        ApiResponse<TicketResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(ticketService.getTicketById(id));
        return apiResponse;
    }

    @PutMapping("/{id}")
    public ApiResponse<TicketResponse> updateTicket(
        @PathVariable("id") String id,
        @RequestBody @Valid UpdateTicketRequest request
    ) {
        ApiResponse<TicketResponse> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Ticket has been updated successfully!");
        apiResponse.setResult(ticketService.updateTicket(id, request));
        return apiResponse;
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteTicket(@PathVariable("id") String id) {
        ApiResponse<String> apiResponse = new ApiResponse<>();
        ticketService.deleteTicket(id);
        apiResponse.setMessage("Ticket has been deleted successfully!");
        return apiResponse;
    }
}
