package com.ltweb.backend.exception;

import java.util.Date;
import java.util.List;

// import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import com.ltweb.backend.dto.response.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;


import lombok.extern.slf4j.Slf4j;

@RestControllerAdvice
@Slf4j(topic = "Global-Exception")
public class GlobalExceptionHandler {
    // 1. Xử lý Custom Exception
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ErrorResponse> handleJavaBuilderException(
            AppException exception, WebRequest request) {
        
        ErrorResponse response = ErrorResponse.builder()
                .code(exception.getErrorCode().getCode())
                .error(exception.getErrorCode().getStatus().getReasonPhrase())
                .message(exception.getMessage())
                .timestamp(new Date())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();

        return ResponseEntity
                .status(exception.getErrorCode().getStatus())
                .body(response);
    }

    // 2. Xử lý Validation Errors
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException e, WebRequest request) {

        BindingResult bindingResult = e.getBindingResult();
        List<FieldError> fieldErrors = bindingResult.getFieldErrors();
        
        // Lấy tất cả error messages
        List<String> errors = fieldErrors.stream()
                .map(FieldError::getDefaultMessage)
                .toList();

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(new Date())
                .code(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message(errors.size() > 1 ? errors.toString() : errors.get(0))
                .path(request.getDescription(false).replace("uri=", ""))
                .build();

        return ResponseEntity.badRequest().body(errorResponse);
    }

    // 3. Xử lý Authentication Errors
    // @ExceptionHandler(BadCredentialsException.class)
    // public ResponseEntity<ErrorResponse> handleBadCredentialsException(
    //         BadCredentialsException exception, WebRequest request) {
        
    //     log.error("Authentication failed: {}", exception.getMessage());
    //     ErrorResponse response = buildErrorCodeResponse(ErrorCode.UNAUTHORIZED, request);
    //     return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    // }

    // 4. Xử lý Missing Headers/Cookies
    @ExceptionHandler(MissingRequestHeaderException.class)
    public ResponseEntity<ErrorResponse> handleMissingRequestHeaderException(
            MissingRequestHeaderException exception, WebRequest request) {

        ErrorResponse response = ErrorResponse.builder()
                .timestamp(new Date())
                .code(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message("Required header '" + exception.getHeaderName() + "' is missing")
                .path(request.getDescription(false).replace("uri=", ""))
                .build();

        return ResponseEntity.badRequest().body(response);
    }

    // 5. Xử lý Database Constraint Violations
    // @ExceptionHandler(DataIntegrityViolationException.class)
    // public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(
    //         DataIntegrityViolationException exception, WebRequest request) {
    //    
    //     ErrorResponse response = buildErrorCodeResponse(
    //             ErrorCode.DATA_INTEGRITY_VIOLATION, request);
    //     return ResponseEntity.badRequest().body(response);
    // }

    // 6. Catch-all cho các exceptions không được xử lý
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleAllExceptions(
            Exception ex, WebRequest request) {
        
        log.error("Unexpected exception occurred: ", ex);
        ErrorResponse response = buildErrorCodeResponse(ErrorCode.INTERNAL_ERROR, request);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    // Helper method để build ErrorResponse từ ErrorCode
    private ErrorResponse buildErrorCodeResponse(ErrorCode errorCode, WebRequest request) {
        return ErrorResponse.builder()
                .timestamp(new Date())
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .error(errorCode.getStatus().getReasonPhrase())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
    }
}
