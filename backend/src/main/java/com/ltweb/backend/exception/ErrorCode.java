package com.ltweb.backend.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    // General Errors
    INTERNAL_ERROR(500, "Unexpected error occurred", HttpStatus.INTERNAL_SERVER_ERROR),
    
    // Authentication & Authorization
    UNAUTHORIZED(401, "Email or password incorrect", HttpStatus.UNAUTHORIZED),
    ACCESS_DENIED(403, "Access denied", HttpStatus.FORBIDDEN),
    TOKEN_INVALID(401, "Invalid JWT token", HttpStatus.UNAUTHORIZED),
    
    // User Management
    USER_EXISTED(400, "User already exists", HttpStatus.BAD_REQUEST),
    USER_NOT_FOUND(400, "User does not exist", HttpStatus.BAD_REQUEST),

    //Sign up
    EMAIL_EXISTED(400, "Email already exists", HttpStatus.BAD_REQUEST),
    PHONENUMBER_EXISTED(400, "Phone number already exists", HttpStatus.BAD_REQUEST),
    USERNAME_EXISTED(400, "Username already exists", HttpStatus.BAD_REQUEST),
    ;
    private final int code;
    private final String message;
    private final HttpStatus status;
}
