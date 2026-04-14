package com.ltweb.backend.mapper;

import com.ltweb.backend.dto.request.CreateFilmRequest;
import com.ltweb.backend.dto.request.UpdateFilmRequest;
import com.ltweb.backend.dto.response.FilmResponse;
import com.ltweb.backend.entity.Film;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = GenreMapper.class)
public interface FilmMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "genres", ignore = true)
    Film toFilm(CreateFilmRequest request);

    @Mapping(target = "filmId", source = "id")
    FilmResponse toFilmResponse(Film film);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "genres", ignore = true)
    void updateFilm(@MappingTarget Film film, UpdateFilmRequest request);
}
