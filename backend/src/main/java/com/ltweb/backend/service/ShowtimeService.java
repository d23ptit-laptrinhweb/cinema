package com.ltweb.backend.service;

import java.util.List;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import com.ltweb.backend.dto.request.CreateShowtimeRequest;
import com.ltweb.backend.dto.request.UpdateShowtimeRequest;
import com.ltweb.backend.dto.response.ShowtimeResponse;
import com.ltweb.backend.entity.Film;
import com.ltweb.backend.entity.Room;
import com.ltweb.backend.entity.Showtime;
import com.ltweb.backend.exception.AppException;
import com.ltweb.backend.exception.ErrorCode;
import com.ltweb.backend.mapper.ShowtimeMapper;
import com.ltweb.backend.repository.FilmRepository;
import com.ltweb.backend.repository.RoomRepository;
import com.ltweb.backend.repository.ShowtimeRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ShowtimeService {

    private final ShowtimeRepository showtimeRepository;
    private final RoomRepository roomRepository;
    private final FilmRepository filmRepository;
    private final ShowtimeMapper showtimeMapper;
    private final TicketService ticketService;

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ShowtimeResponse create(CreateShowtimeRequest request) {

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        Film film = filmRepository.findById(request.getFilmId())
                .orElseThrow(() -> new AppException(ErrorCode.FILM_NOT_FOUND));

        if (showtimeRepository.existsOverlappingShowtime(request.getRoomId(), request.getStartTime(), request.getEndTime())) {
            throw new AppException(ErrorCode.SHOWTIME_TIME_OVERLAP);
        }

        Showtime showtime = showtimeMapper.toShowtime(request);
        showtime.setRoom(room);
        showtime.setFilm(film);

        Showtime savedShowtime = showtimeRepository.save(showtime);
        ticketService.createTicket(savedShowtime);

        return showtimeMapper.toResponse(savedShowtime);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public ShowtimeResponse update(String id, UpdateShowtimeRequest request) {

        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Showtime not found"));

        showtimeMapper.updateShowtime(showtime, request);

        return showtimeMapper.toResponse(showtime);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void delete(String id) {
        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Showtime not found"));

        showtimeRepository.delete(showtime);
    }

    public ShowtimeResponse getById(String id) {
        return showtimeRepository.findById(id)
                .map(showtimeMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Showtime not found"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<ShowtimeResponse> getByRoom(Long roomId) {
        return showtimeRepository.findByRoomId(roomId)
                .stream()
                .map(showtimeMapper::toResponse)
                .toList();
    }

    public List<ShowtimeResponse> getByFilm(String filmId) {
        return showtimeRepository.findByFilmId(filmId)
                .stream()
                .map(showtimeMapper::toResponse)
                .toList();
    }

    public List<ShowtimeResponse> getByFilmAndDateAndBranch(String filmId, LocalDate date, String branchId) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();

        return showtimeRepository.findByFilmAndDateAndBranch(filmId, startOfDay, endOfDay, branchId)
                .stream()
                .map(showtimeMapper::toResponse)
                .toList();
    }
}