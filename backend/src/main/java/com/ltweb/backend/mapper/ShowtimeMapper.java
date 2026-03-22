package com.ltweb.backend.mapper;

import org.mapstruct.*;

import com.ltweb.backend.dto.request.CreateShowtimeRequest;
import com.ltweb.backend.dto.request.UpdateShowtimeRequest;
import com.ltweb.backend.dto.response.ShowtimeResponse;
import com.ltweb.backend.entity.Showtime;

@Mapper(componentModel = "spring")
public interface ShowtimeMapper {
    @Mapping(target = "showtimeId", ignore = true)
    @Mapping(target = "room", ignore = true)
    @Mapping(target = "film", ignore = true)
    @Mapping(target = "tickets", ignore = true)
    @Mapping(target = "bookings", ignore = true)
    Showtime toShowtime(CreateShowtimeRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "showtimeId", ignore = true)
    @Mapping(target = "room", ignore = true)
    @Mapping(target = "film", ignore = true)
    @Mapping(target = "tickets", ignore = true)
    @Mapping(target = "bookings", ignore = true)
    void updateShowtime(@MappingTarget Showtime showtime, UpdateShowtimeRequest request);

    @Mapping(source = "showtimeId", target = "showtimeId")
    @Mapping(source = "room.id", target = "roomId")
    @Mapping(source = "film.id", target = "filmId")
    ShowtimeResponse toResponse(Showtime showtime);
}