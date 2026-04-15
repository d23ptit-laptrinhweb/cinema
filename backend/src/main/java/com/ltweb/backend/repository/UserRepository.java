package com.ltweb.backend.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.ltweb.backend.entity.User;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String>, JpaSpecificationExecutor<User> {
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phoneNumber);

    @EntityGraph(attributePaths = {"bookings.showtime"})
    Optional<User> findByUsername(String username);
    
    @EntityGraph(attributePaths = {"bookings.showtime"})
    Optional<User> findByEmail(String email);
    
    @EntityGraph(attributePaths = {"bookings.showtime"})
    Optional<User> findByPhoneNumber(String phoneNumber);

    void deleteById(String id);

}
