package com.ltweb.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.ltweb.backend.dto.request.CreateTicketRequest;
import com.ltweb.backend.dto.request.UpdateTicketRequest;
import com.ltweb.backend.dto.response.TicketResponse;
import com.ltweb.backend.entity.Booking;
import com.ltweb.backend.entity.Seat;
import com.ltweb.backend.entity.Showtime;
import com.ltweb.backend.entity.Ticket;
import com.ltweb.backend.exception.AppException;
import com.ltweb.backend.exception.ErrorCode;
import com.ltweb.backend.repository.BookingRepository;
import com.ltweb.backend.repository.SeatRepository;
import com.ltweb.backend.repository.ShowtimeRepository;
import com.ltweb.backend.repository.TicketRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final BookingRepository bookingRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;

    public TicketResponse createTicket(CreateTicketRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
            .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        Showtime showtime = showtimeRepository.findById(request.getShowtimeId())
            .orElseThrow(() -> new AppException(ErrorCode.SHOWTIME_NOT_FOUND));

        Seat seat = seatRepository.findById(request.getSeatId())
            .orElseThrow(() -> new AppException(ErrorCode.SEAT_NOT_FOUND));

        if (ticketRepository.existsByShowtimeShowtimeIdAndSeatSeatId(request.getShowtimeId(), request.getSeatId())) {
            throw new AppException(ErrorCode.TICKET_ALREADY_EXISTS);
        }

        Ticket ticket = Ticket.builder()
            .booking(booking)
            .showtime(showtime)
            .seat(seat)
            .price(request.getPrice())
            .ticketStatus(request.getTicketStatus())
            .qrCode(request.getQrCode())
            .build();

        return toTicketResponse(ticketRepository.save(ticket));
    }

    public List<TicketResponse> getAllTickets() {
        return ticketRepository.findAll().stream()
            .map(this::toTicketResponse)
            .toList();
    }

    public TicketResponse getTicketById(String ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new AppException(ErrorCode.TICKET_NOT_FOUND));
        return toTicketResponse(ticket);
    }

    public TicketResponse updateTicket(String ticketId, UpdateTicketRequest request) {
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new AppException(ErrorCode.TICKET_NOT_FOUND));

        if (request.getBookingId() != null && !request.getBookingId().isBlank()) {
            Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
            ticket.setBooking(booking);
        }

        if (request.getShowtimeId() != null && !request.getShowtimeId().isBlank()) {
            Showtime showtime = showtimeRepository.findById(request.getShowtimeId())
                .orElseThrow(() -> new AppException(ErrorCode.SHOWTIME_NOT_FOUND));
            ticket.setShowtime(showtime);
        }

        if (request.getSeatId() != null && !request.getSeatId().isBlank()) {
            Seat seat = seatRepository.findById(request.getSeatId())
                .orElseThrow(() -> new AppException(ErrorCode.SEAT_NOT_FOUND));
            ticket.setSeat(seat);
        }

        if ((request.getShowtimeId() != null && !request.getShowtimeId().isBlank())
            || (request.getSeatId() != null && !request.getSeatId().isBlank())) {
            String currentShowtimeId = ticket.getShowtime().getShowtimeId();
            String currentSeatId = ticket.getSeat().getId();

            Optional<Ticket> duplicatedTicket =
                ticketRepository.findByShowtimeShowtimeIdAndSeatSeatId(currentShowtimeId, currentSeatId);

            if (duplicatedTicket.isPresent()
                && !duplicatedTicket.get().getTicket_id().equals(ticket.getTicket_id())) {
                throw new AppException(ErrorCode.TICKET_ALREADY_EXISTS);
            }
        }

        if (request.getPrice() != null) {
            ticket.setPrice(request.getPrice());
        }

        if (request.getTicketStatus() != null) {
            ticket.setTicketStatus(request.getTicketStatus());
        }

        if (request.getQrCode() != null) {
            ticket.setQrCode(request.getQrCode());
        }

        return toTicketResponse(ticketRepository.save(ticket));
    }

    public void deleteTicket(String ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new AppException(ErrorCode.TICKET_NOT_FOUND));
        ticketRepository.delete(ticket);
    }

    private TicketResponse toTicketResponse(Ticket ticket) {
        return TicketResponse.builder()
            .ticketId(ticket.getTicket_id())
            .bookingId(ticket.getBooking() != null ? ticket.getBooking().getBooking_id() : null)
            .showtimeId(ticket.getShowtime() != null ? ticket.getShowtime().getShowtimeId() : null)
            .seatId(ticket.getSeat() != null ? ticket.getSeat().getId() : null)
            .price(ticket.getPrice())
            .ticketStatus(ticket.getTicketStatus())
            .qrCode(ticket.getQrCode())
            .build();
    }
}
