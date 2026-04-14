package com.ltweb.backend.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.ltweb.backend.entity.*;
import com.ltweb.backend.enums.SeatType;
import com.ltweb.backend.enums.TicketStatus;

import com.ltweb.backend.mapper.TicketMapper;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import com.ltweb.backend.dto.request.UpdateTicketRequest;
import com.ltweb.backend.dto.response.TicketResponse;
import com.ltweb.backend.exception.AppException;
import com.ltweb.backend.exception.ErrorCode;
import com.ltweb.backend.repository.BookingRepository;
import com.ltweb.backend.repository.SeatTypePriceRepository;
import com.ltweb.backend.repository.SeatRepository;
import com.ltweb.backend.repository.ShowtimeRepository;
import com.ltweb.backend.repository.TicketRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final BookingRepository bookingRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    private final SeatTypePriceRepository seatTypePriceRepository;
    private final StringRedisTemplate redisTemplate;
    private final TicketMapper ticketMapper;

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void createTicket(Showtime showtime) {
        List<Seat> seats = seatRepository.findByRoomId(showtime.getRoom().getId());

        // lấy sẵn seatTypePrice ra thay vì mỗi lần lại phải chọc vào db để lấy, tránh N + 1
        Map<SeatType, BigDecimal> pricesMap = seatTypePriceRepository.findAll().stream().collect(
                Collectors.toMap(
                        SeatTypePrice::getSeatType,
                        SeatTypePrice::getPrice
                )
        );

        List<Ticket> tickets = seats.stream().map(seat -> Ticket.builder()
                .price(pricesMap.get(seat.getSeatType()))
                .ticketStatus(TicketStatus.AVAILABLE)
                .showtime(showtime)
                .seat(seat)
                .build()).toList();

        ticketRepository.saveAll(tickets);
    }

    @Transactional(readOnly = true)
    public List<TicketResponse> getAllTickets() {
        return ticketRepository.findAll().stream()
                .map(ticketMapper::toTicketResponse)
                .toList();
    }

    // Không dùng @Cacheable vì cần đọc Redis seat lock real-time mỗi request
    public List<TicketResponse> getTicketsByShowtimeId(String showtimeId) {

        // Bước 1: Lấy toàn bộ ticket của suất chiếu từ DB
        List<Ticket> dbTickets = ticketRepository.findByShowtimeId(showtimeId);

        List<TicketResponse> tickets = dbTickets.stream()
                .map(ticketMapper::toTicketResponse)
                .toList();

        // Bước 2: Tạo danh sách key Redis tương ứng với từng ghế
        List<String> seatKeys = tickets.stream()
                .map(ticket -> "seat_hold:" + showtimeId + ":" + ticket.getSeatId())
                .toList();

        // Bước 3: Batch query Redis — 1 lần lấy tất cả
        List<String> redisHoldStatus = redisTemplate.opsForValue().multiGet(seatKeys);

        // Bước 4: Merge trạng thái DB với Redis để tạo displayStatus
        for (int i = 0; i < tickets.size(); i++) {
            TicketResponse ticket = tickets.get(i);

            // Ghế đã thanh toán thành công -> luôn BOOKED, không override
            if (ticket.getTicketStatus() == TicketStatus.BOOKED) {
                ticket.setDisplayStatus(TicketStatus.BOOKED);
                continue;
            }

            // Kiểm tra Redis: có key seat_hold -> ghế đang bị giữ bởi user khác
            // check lại cả redis để xác định xem có đúng vé đang bị HOLDING ko
            boolean isHeldInRedis = redisHoldStatus != null && redisHoldStatus.get(i) != null;

            if (isHeldInRedis) {
                // Ghế đang bị lock tạm thời trong Redis (user đang ở bước thanh toán)
                ticket.setDisplayStatus(TicketStatus.HOLDING);
            } else {
                // Không có trong Redis -> lấy trực tiếp từ DB
                ticket.setDisplayStatus(ticket.getTicketStatus());
            }
        }

        return tickets;
    }

    public TicketResponse getTicketById(String ticketId) {
        Ticket ticket = getTicket(ticketId);
        return ticketMapper.toTicketResponse(ticket);
    }

    public TicketResponse updateTicket(String ticketId, UpdateTicketRequest request) {
        Ticket ticket = getTicket(ticketId);

        ticketMapper.updateTicket(ticket, request);

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

        return ticketMapper.toTicketResponse(ticketRepository.save(ticket));
    }

    public void deleteTicket(String ticketId) {
        Ticket ticket = getTicket(ticketId);
        ticketRepository.delete(ticket);
    }

    @Transactional
    public void deleteByShowtimeId(String showtimeId) {
        ticketRepository.deleteByShowtimeId(showtimeId);
    }

    // ===== PRIVATE HELPER =====
    private Ticket getTicket(String ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() -> new AppException(ErrorCode.TICKET_NOT_FOUND));
    }
}
