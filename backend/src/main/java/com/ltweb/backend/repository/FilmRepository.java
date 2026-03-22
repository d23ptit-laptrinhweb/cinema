package com.ltweb.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ltweb.backend.entity.Film;

@Repository
public interface FilmRepository extends JpaRepository<Film, String>{
    
}

