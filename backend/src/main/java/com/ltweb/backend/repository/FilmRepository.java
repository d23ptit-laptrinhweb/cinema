package com.ltweb.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ltweb.backend.entity.Film;
import com.ltweb.backend.enums.FilmStatus;

@Repository
public interface FilmRepository extends JpaRepository<Film, String>{

	@EntityGraph(attributePaths = {"showtimes.room.branch", "genres"})
	List<Film> findByStatus(FilmStatus status);
}

