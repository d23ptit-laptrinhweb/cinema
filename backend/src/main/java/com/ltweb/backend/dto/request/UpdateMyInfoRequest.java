package com.ltweb.backend.dto.request;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateMyInfoRequest {
    private String fullName;
    private LocalDate dob;
    private String phoneNumber;
    private String gender;

    @Email(message = "Email is invalid")
    private String email;
}