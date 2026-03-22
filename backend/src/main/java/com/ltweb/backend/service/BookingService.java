package com.ltweb.backend.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.ltweb.backend.dto.request.CreateBookingRequest;
import com.ltweb.backend.dto.request.UpdateBookingRequest;
import com.ltweb.backend.dto.response.BookingResponse;
import com.ltweb.backend.entity.Booking;
import com.ltweb.backend.entity.Seat;
import com.ltweb.backend.entity.Showtime;
import com.ltweb.backend.entity.Ticket;
import com.ltweb.backend.entity.User;
import com.ltweb.backend.enums.BookingStatus;
import com.ltweb.backend.enums.TicketStatus;
import com.ltweb.backend.exception.AppException;
import com.ltweb.backend.exception.ErrorCode;
import com.ltweb.backend.repository.BookingRepository;
import com.ltweb.backend.repository.PaymentRepository;
import com.ltweb.backend.repository.SeatRepository;
import com.ltweb.backend.repository.ShowtimeRepository;
import com.ltweb.backend.repository.TicketRepository;
import com.ltweb.backend.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;

    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request) {
        // Get current user
        var context = SecurityContextHolder.getContext();
        String username = Objects.requireNonNull(context.getAuthentication()).getName();
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Get showtime
        Showtime showtime = showtimeRepository.findById(request.getShowtimeId())
            .orElseThrow(() -> new AppException(ErrorCode.SHOWTIME_NOT_FOUND));

        // Validate and get seats
        List<Seat> selectedSeats = request.getSeatIds().stream()
            .map(seatId -> seatRepository.findById(seatId)
                .orElseThrow(() -> new AppException(ErrorCode.SEAT_NOT_FOUND)))
            .toList();

        // Get and validate existing tickets for selected seats
        List<Ticket> ticketsToReserve = selectedSeats.stream()
            .map(seat -> ticketRepository.findByShowtimeIdAndSeatId(
                showtime.getId(), seat.getId()
            )
            .orElseThrow(() -> new AppException(ErrorCode.TICKET_NOT_FOUND)))
            .toList();

        // Check if all tickets are available
        for (Ticket ticket : ticketsToReserve) {
            if (ticket.getTicketStatus() != TicketStatus.AVAILABLE) {
                throw new AppException(ErrorCode.TICKET_ALREADY_EXISTS);
            }
        }

        // Calculate total amount
        BigDecimal totalAmount = showtime.getBasePrice()
            .multiply(new BigDecimal(selectedSeats.size()));

        // Create booking
        String bookingCode = generateBookingCode();
        Booking booking = Booking.builder()
            .bookingCode(bookingCode)
            .user(user)
            .showtime(showtime)
            .totalAmount(totalAmount)
            .status(BookingStatus.PENDING)
            .expiresAt(LocalDateTime.now().plusMinutes(15))
            .build();

        booking = bookingRepository.save(booking);

        // Update existing tickets: link to booking and change status to HOLDING
        final Booking finalBooking = booking;
        ticketsToReserve.forEach(ticket -> {
            ticket.setBooking(finalBooking);
            ticket.setTicketStatus(TicketStatus.HOLDING);
        });

        ticketRepository.saveAll(ticketsToReserve);
        booking.setTickets(ticketsToReserve);

        log.info("Booking created with code: {} for user: {}", bookingCode, username);

        return toBookingResponse(booking);
    }

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
            .map(this::toBookingResponse)
            .toList();
    }

    public BookingResponse getBookingById(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
        return toBookingResponse(booking);
    }

    public BookingResponse getMyBookings(String bookingId) {
        var context = SecurityContextHolder.getContext();
        String username = Objects.requireNonNull(context.getAuthentication()).getName();
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        return toBookingResponse(booking);
    }

    public List<BookingResponse> getMyBookingsList() {
        var context = SecurityContextHolder.getContext();
        String username = Objects.requireNonNull(context.getAuthentication()).getName();
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return bookingRepository.findByUserId(user.getId()).stream()
            .map(this::toBookingResponse)
            .toList();
    }

    @Transactional
    public BookingResponse updateBooking(String bookingId, UpdateBookingRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        if (request.getStatus() != null) {
            booking.setStatus(request.getStatus());
        }

        booking = bookingRepository.save(booking);
        return toBookingResponse(booking);
    }

    @Transactional
    public void cancelBooking(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        // Only allow cancelling PENDING bookings (not yet paid)
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new AppException(ErrorCode.BOOKING_CANNOT_CANCEL);
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        // Revert ticket status from HOLDING back to AVAILABLE
        booking.getTickets().forEach(ticket -> {
            ticket.setBooking(null);
            ticket.setTicketStatus(TicketStatus.AVAILABLE);
            ticketRepository.save(ticket);
        });

        // Cancel any pending payment for this booking
        var payments = paymentRepository.findByBookingId(bookingId);
        if (!payments.isEmpty()) {
            var payment = payments.get(0);
            if (payment.getPaymentStatus() == com.ltweb.backend.enums.PaymentStatus.PENDING) {
                payment.setPaymentStatus(com.ltweb.backend.enums.PaymentStatus.CANCELLED);
                paymentRepository.save(payment);
            }
        }

        log.info("Booking cancelled: {}", bookingId);
    }

    private String generateBookingCode() {
        // Format: BK-YYYYMMDD-XXXXXX (6 random characters)
        String timestamp = LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomPart = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "BK-" + timestamp + "-" + randomPart;
    }

    private BookingResponse toBookingResponse(Booking booking) {
        return BookingResponse.builder()
            .bookingId(booking.getId())
            .bookingCode(booking.getBookingCode())
            .userId(booking.getUser().getId())
            .showtimeId(booking.getShowtime().getId())
            .totalAmount(booking.getTotalAmount())
            .status(booking.getStatus())
            .expiresAt(booking.getExpiresAt())
            .createdAt(booking.getCreatedAt())
            .updatedAt(booking.getUpdatedAt())
            .tickets(booking.getTickets().stream()
                .map(ticket -> com.ltweb.backend.dto.response.TicketResponse.builder()
                    .ticketId(ticket.getId())
                    .bookingId(ticket.getBooking() != null ? ticket.getBooking().getId() : null)
                    .showtimeId(ticket.getShowtime().getId())
                    .seatId(ticket.getSeat().getId())
                    .price(ticket.getPrice())
                    .ticketStatus(ticket.getTicketStatus())
                    .qrCode(ticket.getQrCode())
                    .build())
                .toList())
            .build();
    }
}
