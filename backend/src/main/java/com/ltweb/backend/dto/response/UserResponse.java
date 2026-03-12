package com.ltweb.backend.dto.response;


import java.time.LocalDate;

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
    private String role;
    private LocalDate dob;
    private String gender;
}
