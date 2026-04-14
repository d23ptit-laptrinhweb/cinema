package com.ltweb.backend.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import com.ltweb.backend.dto.response.SeatStatusEvent;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.ltweb.backend.dto.request.CreateBookingRequest;
import com.ltweb.backend.dto.request.UpdateBookingRequest;
import com.ltweb.backend.dto.response.BookingResponse;
import com.ltweb.backend.dto.response.TicketResponse;
import com.ltweb.backend.entity.Booking;
import com.ltweb.backend.entity.Showtime;
import com.ltweb.backend.entity.Ticket;
import com.ltweb.backend.entity.User;
import com.ltweb.backend.enums.BookingStatus;
import com.ltweb.backend.enums.PaymentStatus;
import com.ltweb.backend.enums.TicketStatus;
import com.ltweb.backend.exception.AppException;
import com.ltweb.backend.exception.ErrorCode;
import com.ltweb.backend.repository.BookingRepository;
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
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final SimpMessagingTemplate simpMessagingTemplate;

    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request) {
        var context = SecurityContextHolder.getContext();
        String username = Objects.requireNonNull(context.getAuthentication()).getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Showtime showtime = showtimeRepository.findById(request.getShowtimeId())
                .orElseThrow(() -> new AppException(ErrorCode.SHOWTIME_NOT_FOUND));

        Set<String> uniqueSeatIds = new HashSet<>(request.getSeatIds());
        if (uniqueSeatIds.size() != request.getSeatIds().size()) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }

        List<Ticket> selectedTickets = request.getSeatIds().stream()
                .map(seatId -> ticketRepository.findByShowtimeIdAndSeatId(showtime.getId(), seatId)
                        .orElseThrow(() -> new AppException(ErrorCode.TICKET_NOT_FOUND)))
                .toList();

        boolean hasUnavailableTicket = selectedTickets.stream()
                .anyMatch(ticket -> ticket.getTicketStatus() != TicketStatus.AVAILABLE);

        if (hasUnavailableTicket) {
            throw new AppException(ErrorCode.TICKET_NOT_AVAILABLE);
        }

        // khoá ghế bằng Redis
        String bookingUserId = user.getId();
        for (Ticket ticket : selectedTickets) {
            String seatKey = getSeatKey(showtime.getId(), ticket.getSeat().getId());
            Boolean locked = redisTemplate.opsForValue().setIfAbsent(seatKey, bookingUserId, 10, TimeUnit.MINUTES);

            if (Boolean.FALSE.equals(locked)) {
                unlockSeats(showtime.getId(), selectedTickets);
                throw new AppException(ErrorCode.TICKET_NOT_AVAILABLE);
            }

           
            simpMessagingTemplate.convertAndSend(
                    "/topic/showtime/" + showtime.getId() + "/seats",
                    SeatStatusEvent.builder()
                            .seatId(ticket.getSeat().getId())
                            .status("HOLDING")
                            .build());
        }

        BigDecimal totalAmount = selectedTickets.stream()
                .map(Ticket::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String bookingCode = generateBookingCode();
        Booking booking = Booking.builder()
                .bookingCode(bookingCode)
                .user(user)
                .showtime(showtime)
                .totalAmount(totalAmount)
                .status(BookingStatus.PENDING)
                .paymentCreatedAt(LocalDateTime.now())
                .paymentStatus(PaymentStatus.PENDING)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .build();

        bookingRepository.save(booking);

        selectedTickets.forEach(ticket -> {
            ticket.setBooking(booking);
            ticket.setTicketStatus(TicketStatus.HOLDING);
        });
        ticketRepository.saveAll(selectedTickets);
        booking.setTickets(selectedTickets);

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

            simpMessagingTemplate.convertAndSend(
                    "/topic/showtime/" + booking.getShowtime().getId() + "/seats",
                    SeatStatusEvent.builder()
                            .seatId(ticket.getSeat().getId())
                            .status("AVAILABLE")
                            .build());
        });

        unlockSeats(booking.getShowtime().getId(), booking.getTickets());

        if (booking.getPaymentStatus() == PaymentStatus.PENDING) {
            booking.setPaymentStatus(PaymentStatus.CANCELLED);
            bookingRepository.save(booking);
        }

        log.info("Booking cancelled: {}", bookingId);
    }

    private String generateBookingCode() {
        // Format: BK-YYYYMMDD-XXXXXX (6 random characters)
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
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
                .paymentMethod(booking.getPaymentMethod())
                .paymentStatus(booking.getPaymentStatus())
                .providerTxnId(booking.getProviderTxnId())
                .paidAt(booking.getPaidAt())
                .paymentCreatedAt(booking.getPaymentCreatedAt())
                .tickets(booking.getTickets().stream()
                        .map(ticket -> TicketResponse.builder()
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

    private String getSeatKey(String showTimeId, String seatId) {
        return "seat_hold:" + showTimeId + ":" + seatId;
    }

    private void unlockSeats(String showTimeId, List<Ticket> tickets) {
        try {
            List<String> keys = tickets.stream()
                    .map(ticket -> getSeatKey(showTimeId, ticket.getSeat().getId()))
                    .toList();
            redisTemplate.delete(keys);
        } catch (Exception e) {
            log.error("Thất bại trong việc xoá vé: {}", e.getMessage());
        }
    }
}
