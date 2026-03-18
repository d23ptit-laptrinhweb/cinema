package com.ltweb.backend.dto.request;

import java.time.LocalDate;

import com.ltweb.backend.enums.UserRole;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {
    private String password;
    private String fullName;
    private LocalDate dob;
    private String phoneNumber;
    private String gender;
    private String email;
    private UserRole role;
}
