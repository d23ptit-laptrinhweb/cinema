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
    UNAUTHORIZED(401, "Unauthorized", HttpStatus.UNAUTHORIZED),
    LOGIN_FAILED(401, "Email or password incorrect", HttpStatus.UNAUTHORIZED),
    ACCESS_DENIED(403, "Access denied", HttpStatus.FORBIDDEN),
    TOKEN_INVALID(401, "Invalid JWT token", HttpStatus.UNAUTHORIZED),
    TOKEN_SIGNING_FAILED(500, "Failed to sign JWT token", HttpStatus.INTERNAL_SERVER_ERROR),
    
    // User Management
    USER_EXISTED(400, "User already exists", HttpStatus.BAD_REQUEST),
    USER_NOT_FOUND(400, "User does not exist", HttpStatus.BAD_REQUEST),

    // Request Validation
    VALIDATION_ERROR(400, "Request validation failed", HttpStatus.BAD_REQUEST),
    MISSING_REQUEST_HEADER(400, "Required request header is missing", HttpStatus.BAD_REQUEST),
    TOO_MANY_REQUESTS(429, "Too many requests", HttpStatus.TOO_MANY_REQUESTS),
    // Branch Management
    BRANCH_NOT_FOUND(400, "Branch does not exist", HttpStatus.BAD_REQUEST),

    // Room Management
    ROOM_NOT_FOUND(400, "Room does not exist", HttpStatus.BAD_REQUEST),

    // Seat Management
    SEAT_NOT_FOUND(400, "Seat does not exist", HttpStatus.BAD_REQUEST),

    // Film Management
    FILM_NOT_FOUND(400, "Film does not exist", HttpStatus.BAD_REQUEST),

    // Genre Management
    GENRE_NOT_FOUND(400, "Genre does not exist", HttpStatus.BAD_REQUEST),

    // Showtime Management
    SHOWTIME_NOT_FOUND(400, "Showtime does not exist", HttpStatus.BAD_REQUEST),

    // Booking Management
    BOOKING_NOT_FOUND(400, "Booking does not exist", HttpStatus.BAD_REQUEST),

    // Ticket Management
    TICKET_NOT_FOUND(400, "Ticket does not exist", HttpStatus.BAD_REQUEST),
    TICKET_ALREADY_EXISTS(400, "Ticket already exists for this showtime and seat", HttpStatus.BAD_REQUEST),

    //Sign up
    DATA_INTEGRITY_VIOLATION(400, "Username or email already existed!", HttpStatus.BAD_REQUEST)
    ;
    private final int code;
    private final String message;
    private final HttpStatus status;
}
