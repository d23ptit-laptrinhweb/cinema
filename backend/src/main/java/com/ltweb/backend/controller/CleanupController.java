package com.ltweb.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.ltweb.backend.dto.response.ApiResponse;

import com.ltweb.backend.entity.User;
import com.ltweb.backend.enums.UserRole;
import com.ltweb.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.ltweb.backend.entity.SeatTypePrice;
import com.ltweb.backend.enums.SeatType;
import com.ltweb.backend.repository.SeatTypePriceRepository;
import java.math.BigDecimal;
import java.util.Arrays;

@RestController
@RequestMapping("/v1/cleanup")
@RequiredArgsConstructor
public class CleanupController {

    private final JdbcTemplate jdbcTemplate;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SeatTypePriceRepository seatTypePriceRepository;

    @DeleteMapping("/database")
    public ApiResponse<String> cleanupDatabase() {
        jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0");
        
        String[] tables = {
            "tickets", "bookings", "showtimes", "seats", "rooms", 
            "branches", "film_genres", "films", "genres", "seat_type_prices", "users"
        };
        
        for (String table : tables) {
            try {
                jdbcTemplate.execute("TRUNCATE TABLE " + table);
            } catch (Exception e) {
                // Table might not exist yet
            }
        }
        
        jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");

        // Re-init Admin
        if (userRepository.findByUsername("admin").isEmpty()) {
            User user = User.builder()
                .username("admin")
                .password(passwordEncoder.encode("admin@123"))
                .role(UserRole.ADMIN)
                .build();
            userRepository.save(user);
        }

        // Re-init SeatTypePrices
        if (seatTypePriceRepository.count() == 0) {
            Arrays.asList(SeatType.values()).forEach(type -> {
                BigDecimal price = switch (type) {
                    case STANDARD -> new BigDecimal("60000");
                    case VIP -> new BigDecimal("90000");
                    case COUPLE -> new BigDecimal("150000");
                    default -> new BigDecimal("50000");
                };
                seatTypePriceRepository.save(SeatTypePrice.builder()
                        .seatType(type)
                        .price(price)
                        .build());
            });
        }
        
        return ApiResponse.<String>builder()
                .result("Database cleaned and essential default data re-initialized.")
                .build();
    }
}
