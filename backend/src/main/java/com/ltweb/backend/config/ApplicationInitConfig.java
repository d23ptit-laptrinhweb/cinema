package com.ltweb.backend.config;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.ltweb.backend.entity.User;
import com.ltweb.backend.enums.UserRole;
import com.ltweb.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.ltweb.backend.entity.SeatTypePrice;
import com.ltweb.backend.enums.SeatType;
import com.ltweb.backend.repository.SeatTypePriceRepository;
import java.math.BigDecimal;
import java.util.Arrays;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class ApplicationInitConfig {

    private final PasswordEncoder passwordEncoder;
    private final SeatTypePriceRepository seatTypePriceRepository;

    @Bean
    public ApplicationRunner applicationRunner(UserRepository userRepository) {
        return args -> {
            // Init admin
            if (userRepository.findByUsername("admin").isEmpty()) {
                User user = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin@123"))
                    .role(UserRole.ADMIN)
                    .build();

                userRepository.save(user);
                log.warn("Admin user has been created with default password \"admin@123\". Please change it immediately.");
            }

            // Init SeatTypePrices
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
                log.info("Default seat type prices have been initialized.");
            }
        };
    }
}
