package com.ltweb.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import com.ltweb.backend.dto.response.SeatStatusEvent;
import com.ltweb.backend.entity.Booking;
import com.ltweb.backend.enums.BookingStatus;
import com.ltweb.backend.enums.PaymentMethod;
import com.ltweb.backend.enums.PaymentStatus;
import com.ltweb.backend.enums.TicketStatus;
import com.ltweb.backend.repository.BookingRepository;
import com.ltweb.backend.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class BookingExpiryScheduler {

    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final SimpMessagingTemplate simpMessagingTemplate;

    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void expirePendingBookings() {
        LocalDateTime now = LocalDateTime.now();
        List<Booking> expiredBookings = bookingRepository.findByStatusAndExpiresAtBefore(BookingStatus.PENDING, now);

        if (expiredBookings.isEmpty()) {
            return;
        }

        for (Booking booking : expiredBookings) {
            expireBooking(booking);
        }

        log.info("Expired {} pending bookings at {}", expiredBookings.size(), now);
    }

    private void expireBooking(Booking booking) {
        booking.setStatus(BookingStatus.EXPIRED);
        booking.setPaymentStatus(PaymentStatus.EXPIRED);
        booking.setPaymentMethod(PaymentMethod.VNPAY);

        booking.getTickets().forEach(ticket -> {
            ticket.setBooking(null);
            ticket.setTicketStatus(TicketStatus.AVAILABLE);
            ticketRepository.save(ticket);
            simpMessagingTemplate.convertAndSend(
                    "/topic/showtime/" + ticket.getShowtime().getId() + "/seats",
                    SeatStatusEvent.builder()
                            .seatId(ticket.getSeat().getId())
                            .status("AVAILABLE")
                            .build());
        });

        bookingRepository.save(booking);
    }
}