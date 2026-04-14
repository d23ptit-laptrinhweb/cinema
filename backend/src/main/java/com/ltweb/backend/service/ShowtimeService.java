package com.ltweb.backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import com.ltweb.backend.dto.request.CreateShowtimeRequest;
import com.ltweb.backend.dto.request.UpdateShowtimeRequest;
import com.ltweb.backend.dto.response.ShowtimeResponse;
import com.ltweb.backend.entity.Film;
import com.ltweb.backend.entity.Room;
import com.ltweb.backend.entity.Showtime;
import com.ltweb.backend.enums.BookingStatus;
import com.ltweb.backend.enums.PaymentStatus;
import com.ltweb.backend.enums.TicketStatus;
import com.ltweb.backend.exception.AppException;
import com.ltweb.backend.exception.ErrorCode;
import com.ltweb.backend.mapper.ShowtimeMapper;
import com.ltweb.backend.repository.BookingRepository;
import com.ltweb.backend.repository.FilmRepository;
import com.ltweb.backend.repository.RoomRepository;
import com.ltweb.backend.repository.ShowtimeRepository;
import com.ltweb.backend.repository.TicketRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ShowtimeService {

    private final ShowtimeRepository showtimeRepository;
    private final RoomRepository roomRepository;
    private final FilmRepository filmRepository;
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final ShowtimeMapper showtimeMapper;
    private final TicketService ticketService;


    @Transactional
    public ShowtimeResponse createShowtime(CreateShowtimeRequest request) {

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        Film film = filmRepository.findById(request.getFilmId())
                .orElseThrow(() -> new AppException(ErrorCode.FILM_NOT_FOUND));

        if (showtimeRepository.existsOverlappingShowtime(request.getRoomId(), request.getStartTime(),
                request.getEndTime())) {
            throw new AppException(ErrorCode.SHOWTIME_TIME_OVERLAP);
        }

        Showtime showtime = showtimeMapper.toShowtime(request);
        showtime.setRoom(room);
        showtime.setFilm(film);

        Showtime savedShowtime = showtimeRepository.save(showtime);
        ticketService.createTicket(savedShowtime);

        return showtimeMapper.toResponse(savedShowtime);
    }

    @Transactional
    public ShowtimeResponse update(String showtimeId, UpdateShowtimeRequest request) {

        Showtime showtime = getShowtime(showtimeId);

        showtimeMapper.updateShowtime(showtime, request);

        // Check overlap nếu thời gian thay đổi
        if (request.getStartTime() != null || request.getEndTime() != null) {
            if (showtimeRepository.existsOverlappingShowtimeExcluding(
                    showtime.getRoom().getId(),
                    showtime.getStartTime(),
                    showtime.getEndTime(),
                    showtimeId)) {
                throw new AppException(ErrorCode.SHOWTIME_TIME_OVERLAP);
            }
        }

        return showtimeMapper.toResponse(showtimeRepository.save(showtime));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void delete(String showtimeId) {
        Showtime showtime = getShowtime(showtimeId);

        // Chặn xóa nếu đã có booking đã thanh toán thành công
        boolean hasPaidBooking = !bookingRepository
                .findByShowtimeIdAndStatus(showtimeId, BookingStatus.COMPLETED)
                .isEmpty();
        if (hasPaidBooking) {
            throw new AppException(ErrorCode.SHOWTIME_HAS_BOOKINGS);
        }

        // Hủy các booking PENDING còn lại
        bookingRepository
                .findByShowtimeIdAndStatus(showtimeId, BookingStatus.PENDING)
                .forEach(b -> {
                    b.setStatus(BookingStatus.CANCELLED);
                    b.setPaymentStatus(PaymentStatus.CANCELLED);
                    b.getTickets().forEach(t -> {
                        t.setBooking(null);
                        t.setTicketStatus(TicketStatus.AVAILABLE);
                    });
                    bookingRepository.save(b);
                });

        // Xóa toàn bộ vé thuộc suất chiếu này trước khi xóa suất chiếu
        ticketRepository.deleteByShowtimeId(showtimeId);

        showtimeRepository.delete(showtime);
    }

    @Transactional(readOnly = true)
    public ShowtimeResponse getById(String showtimeId) {
        Showtime showtime = getShowtime(showtimeId);
        return showtimeMapper.toResponse(showtime);
    }

    @Transactional(readOnly = true)
    public List<ShowtimeResponse> getAll() {
        return showtimeRepository.findAll().stream()
                .sorted(Comparator.comparing(Showtime::getStartTime).reversed())
                .map(showtimeMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ShowtimeResponse> getByRoom(Long roomId) {
        return showtimeRepository.findByRoomId(roomId)
                .stream()
                .map(showtimeMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ShowtimeResponse> getByFilm(String filmId) {
        return showtimeRepository.findByFilmId(filmId)
                .stream()
                .map(showtimeMapper::toResponse)
                .toList();
    }

    /**
     * Lấy suất chiếu theo chi nhánh + ngày, nhóm theo phim.
     * Trả về danh sách Map, mỗi entry chứa thông tin phim + danh sách suất chiếu.
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getByBranch(String branchId, LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        List<Showtime> showtimes = showtimeRepository.findByBranchAndDate(branchId, startOfDay, endOfDay);

        // Nhóm theo film
        Map<String, List<Showtime>> grouped = showtimes.stream()
                .collect(Collectors.groupingBy(
                        s -> s.getFilm().getId(),
                        LinkedHashMap::new,
                        Collectors.toList()));

        List<Map<String, Object>> result = new ArrayList<>();
        for (var entry : grouped.entrySet()) {
            Film film = entry.getValue().getFirst().getFilm();
            Map<String, Object> filmGroup = new LinkedHashMap<>();
            filmGroup.put("filmId", film.getId());
            filmGroup.put("filmName", film.getFilmName());
            filmGroup.put("thumbnailUrl", film.getThumbnailUrl());
            filmGroup.put("durationMinutes", film.getDurationMinutes());
            filmGroup.put("ageRating", film.getAgeRating());
            filmGroup.put("language", film.getLanguage());

            List<Map<String, Object>> showtimeList = entry.getValue().stream()
                    .map(s -> {
                        Map<String, Object> st = new LinkedHashMap<>();
                        st.put("showtimeId", s.getId());
                        st.put("roomId", s.getRoom().getId());
                        st.put("roomName", s.getRoom().getName());
                        st.put("roomType", s.getRoom().getRoomType());
                        st.put("startTime", s.getStartTime());
                        st.put("endTime", s.getEndTime());
                        st.put("status", s.getStatus());
                        return st;
                    })
                    .toList();

            filmGroup.put("showtimes", showtimeList);
            result.add(filmGroup);
        }

        return result;
    }

    // ===== PRIVATE HELPER =====
    private Showtime getShowtime(String showtimeId) {
        return showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new AppException(ErrorCode.SHOWTIME_NOT_FOUND));
    }
}
