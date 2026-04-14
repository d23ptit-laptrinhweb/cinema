package com.ltweb.backend.dto.response;


import java.time.LocalDate;

import com.ltweb.backend.enums.UserRole;

import com.ltweb.backend.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private String id;
    private String fullName;
    private String username;
    private String email;
    private String phoneNumber;
    private UserRole role;
    private LocalDate dob;
    private String gender;
    private UserStatus status;
    private java.time.LocalDateTime createdAt;
}
