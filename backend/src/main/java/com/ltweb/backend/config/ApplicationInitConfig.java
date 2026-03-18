package com.ltweb.backend.config;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


import com.ltweb.backend.enums.UserRole;
import com.ltweb.backend.model.User;
import com.ltweb.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class ApplicationInitConfig {


    @Bean
    public ApplicationRunner applicationRunner(UserRepository userRepository) {
        return args -> {
            if (userRepository.findByUsername("admin").isEmpty()) {
                User user = User.builder()
                    .username("admin")
                    .password("admin@123")
                    .role(UserRole.ADMIN)
                    .build();

                userRepository.save(user);
                log.warn("Admin user created with default password. Please change it immediately.");
            }
        };
    }
}
