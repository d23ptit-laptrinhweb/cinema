package com.ltweb.backend.service;

import java.util.List;

import com.ltweb.backend.enums.TicketStatus;

import org.springframework.data.redis.core.StringRedisTemplate;
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
import com.ltweb.backend.repository.SeatTypePriceRepository;
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
    private final SeatTypePriceRepository seatTypePriceRepository;
    private final StringRedisTemplate redisTemplate;

    @PreAuthorize("hasRole('ADMIN')")
    public void createTicket(Showtime showtime) {
        List<Seat> seats = seatRepository.findByRoomId(showtime.getRoom().getId());

        List<Ticket> tickets = seats.stream().map(seat -> {
            var seatTypePrice = seatTypePriceRepository.findBySeatType(seat.getSeatType())
                    .orElseThrow(() -> new AppException(ErrorCode.SEATTYPE_NOT_EXIST));
            return Ticket.builder()
                    .showtime(showtime)
                    .seat(seat)
                    .price(seatTypePrice.getPrice())
                    .ticketStatus(TicketStatus.AVAILABLE)
                    .build();
        }).toList();

        ticketRepository.saveAll(tickets);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<TicketResponse> getAllTickets() {
        return ticketRepository.findAll().stream()
                .map(this::toTicketResponse)
                .toList();
    }

    // Không dùng @Cacheable vì cần đọc Redis seat lock real-time mỗi request
    public List<TicketResponse> getTicketsByShowtimeId(String showtimeId) {

        // Bước 1: Lấy toàn bộ ticket của suất chiếu từ DB
        List<Ticket> dbTickets = ticketRepository.findByShowtimeId(showtimeId);

        List<TicketResponse> tickets = dbTickets.stream()
                .map(this::toTicketResponse)
                .toList();

        // Bước 2: Tạo danh sách key Redis tương ứng với từng ghế
        List<String> seatKeys = tickets.stream()
                .map(ticket -> "seat_hold:" + showtimeId + ":" + ticket.getSeatId())
                .toList();

        // Bước 3: Batch query Redis — 1 round-trip duy nhất
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
                // Không có trong Redis -> lấy trực tiếp từ DB (AVAILABLE hoặc HOLDING cũ)
                ticket.setDisplayStatus(ticket.getTicketStatus());
            }
        }

        return tickets;
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

        if (request.getTicketStatus() != null) {
            ticket.setTicketStatus(request.getTicketStatus());
        }

        if (request.getQrCode() != null) {
            ticket.setQrCode(request.getQrCode());
        }

        return toTicketResponse(ticket);
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
                .seatCode(ticket.getSeat() != null ? ticket.getSeat().getSeatCode() : null)
                .rowLabel(ticket.getSeat() != null ? ticket.getSeat().getRowLabel() : null)
                .seatNumber(ticket.getSeat() != null ? ticket.getSeat().getSeatNumber() : null)
                .price(ticket.getPrice())
                .ticketStatus(ticket.getTicketStatus())
                .displayStatus(ticket.getTicketStatus()) // mặc định bằng DB, sẽ được override sau
                .qrCode(ticket.getQrCode())
                .build();
    }
}
