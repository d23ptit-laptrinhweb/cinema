package com.ltweb.backend.service;

import java.util.List;
import java.util.Optional;

import com.ltweb.backend.enums.TicketStatus;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

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

    @PreAuthorize("hasRole('ADMIN')")
    public void createTicket(Showtime showtime) {
        List<Seat> seats = seatRepository.findByRoomId(showtime.getRoom().getId());

        List<Ticket> tickets = seats.stream().map(seat->{
            return Ticket.builder()
            .showtime(showtime)
            .seat(seat)
            .price(showtime.getBasePrice())
            .ticketStatus(TicketStatus.AVAILABLE)
            .build();
        }
        ).toList();

        ticketRepository.saveAll(tickets);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<TicketResponse> getAllTickets() {
        return ticketRepository.findAll().stream()
            .map(this::toTicketResponse)
            .toList();
    }

    public List<TicketResponse> getTicketsByShowtimeId(String showtimeId) {
        // Verify showtime exists
        showtimeRepository.findById(showtimeId)
            .orElseThrow(() -> new AppException(ErrorCode.SHOWTIME_NOT_FOUND));

        return ticketRepository.findByShowtimeId(showtimeId).stream()
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
            String currentShowtimeId = ticket.getShowtime().getId();
            String currentSeatId = ticket.getSeat().getId();

            Optional<Ticket> duplicatedTicket =
                ticketRepository.findByShowtimeIdAndSeatId(currentShowtimeId, currentSeatId);

            if (duplicatedTicket.isPresent()
                && !duplicatedTicket.get().getId().equals(ticket.getId())) {
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
            .ticketId(ticket.getId())
            .bookingId(ticket.getBooking() != null ? ticket.getBooking().getId() : null)
            .showtimeId(ticket.getShowtime() != null ? ticket.getShowtime().getId() : null)
            .seatId(ticket.getSeat() != null ? ticket.getSeat().getId() : null)
            .price(ticket.getPrice())
            .ticketStatus(ticket.getTicketStatus())
            .qrCode(ticket.getQrCode())
            .build();
    }
}
