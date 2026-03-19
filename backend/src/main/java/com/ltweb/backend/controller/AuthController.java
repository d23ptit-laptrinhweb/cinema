package com.ltweb.backend.controller;

import com.ltweb.backend.dto.request.LoginRequest;
import com.ltweb.backend.dto.response.ApiResponse;
import com.ltweb.backend.dto.response.LoginResponse;
import com.ltweb.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/auth/login")
    public ApiResponse<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        ApiResponse<LoginResponse> apiResponse = new ApiResponse<>();
        apiResponse.setCode(200);
        apiResponse.setMessage("Login successfully");
        apiResponse.setResult(authService.login(loginRequest));
        return apiResponse;
    }

    @PostMapping("/auth/logout")
    public ApiResponse<Void> logout(@RequestHeader("Authorization") String authHeader) {
        ApiResponse<Void> apiResponse = new ApiResponse<>();
        apiResponse.setCode(200);
        apiResponse.setMessage("Logout successfully");
        authService.logout(authHeader.replace("Bearer ", ""));
        return apiResponse;
    }
}
