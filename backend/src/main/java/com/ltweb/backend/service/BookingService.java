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
import com.ltweb.backend.mapper.BookingMapper;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.ltweb.backend.dto.request.CreateBookingRequest;
import com.ltweb.backend.dto.request.UpdateBookingRequest;
import com.ltweb.backend.dto.response.BookingResponse;
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

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;

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
    private final BookingMapper bookingMapper;

    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request) {
        //người dùng hiện tại
        User user = getUserCurrent();

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
            Boolean locked = redisTemplate.opsForValue().setIfAbsent(seatKey, bookingUserId, 6, TimeUnit.MINUTES);

            if (Boolean.FALSE.equals(locked)) {
                unlockSeats(showtime.getId(), selectedTickets);
                throw new AppException(ErrorCode.TICKET_NOT_AVAILABLE);
            }

            // lock ghế xong broadcast qua WebSocket để cập nhật real time trạng thái hàng ghế
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
                .expiresAt(LocalDateTime.now().plusMinutes(6))
                .build();

        bookingRepository.save(booking);

        selectedTickets.forEach(ticket -> {
            ticket.setBooking(booking);
            ticket.setTicketStatus(TicketStatus.HOLDING);
        });
        ticketRepository.saveAll(selectedTickets);
        booking.setTickets(selectedTickets);

        log.info("Booking created with code: {} for user: {}", bookingCode, user.getUsername());

        return bookingMapper.toBookingResponse(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(bookingMapper::toBookingResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(String bookingId) {
        Booking booking = getBooking(bookingId);
        return bookingMapper.toBookingResponse(booking);
    }

    @Transactional(readOnly = true)
    public BookingResponse getMyBookings(String bookingId) {
        User user = getUserCurrent();

        Booking booking = getBooking(bookingId);

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        return bookingMapper.toBookingResponse(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookingsList() {
        User user = getUserCurrent();

        return bookingRepository.findByUserId(user.getId()).stream()
                .map(bookingMapper::toBookingResponse)
                .toList();
    }

    @Transactional
    public BookingResponse updateBooking(String bookingId, UpdateBookingRequest request) {
        Booking booking = getBooking(bookingId);

        if (request.getStatus() != null) {
            booking.setStatus(request.getStatus());
        }

        return bookingMapper.toBookingResponse(bookingRepository.save(booking));
    }

    @Transactional
    public void cancelBooking(String bookingId) {
        Booking booking = getBooking(bookingId);

        // Chỉ cho phép huỷ khi trạng thái PENDING (đang chờ thanh toán)
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new AppException(ErrorCode.BOOKING_CANNOT_CANCEL);
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        // Trả trạng thái của vé về AVAILABLE
        booking.getTickets().forEach(ticket -> {
            ticket.setBooking(null); // huỷ connect với booking
            ticket.setTicketStatus(TicketStatus.AVAILABLE);
            ticketRepository.save(ticket);

            simpMessagingTemplate.convertAndSend(
                    "/topic/showtime/" + booking.getShowtime().getId() + "/seats",
                    SeatStatusEvent.builder()
                            .seatId(ticket.getSeat().getId())
                            .status("AVAILABLE")
                            .build());
        });

        unlockSeats(booking.getShowtime().getId(), booking.getTickets()); // chủ động huỷ

        if (booking.getPaymentStatus() == PaymentStatus.PENDING) {
            booking.setPaymentStatus(PaymentStatus.CANCELLED);
            bookingRepository.save(booking);
        }

        log.info("Booking cancelled: {}", bookingId);
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

    // ===== PRIVATE HELPER =====
    private User getUserCurrent() {
        String username = Objects.requireNonNull(SecurityContextHolder.getContext().getAuthentication()).getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private String generateBookingCode() {
        // Format: BK-YYYYMMDD-XXXXXX (6 random characters)
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomPart = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "BK-" + timestamp + "-" + randomPart;
    }

    private Booking getBooking(String bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
    }
}
