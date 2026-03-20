package com.ltweb.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.ltweb.backend.dto.request.CreateUserRequest;
import com.ltweb.backend.dto.request.UpdateUserRequest;
import com.ltweb.backend.dto.response.ApiResponse;
import com.ltweb.backend.dto.response.UserResponse;
import com.ltweb.backend.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController()
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping("/sign-up")
    public ApiResponse<UserResponse> createUser(@RequestBody @Valid CreateUserRequest createUserRequest){
        ApiResponse<UserResponse> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Register successfully!");
        apiResponse.setResult(userService.createUser(createUserRequest));
        return apiResponse;
    }

    @GetMapping("/users")
    public ApiResponse<List<UserResponse>> getAllUser(){
        ApiResponse<List<UserResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(userService.getAllUser());
        return apiResponse;
    }

    @GetMapping("/users/{id}")
    public ApiResponse<UserResponse> getUserById(@PathVariable String id){
        ApiResponse<UserResponse> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Get User by id!");
        apiResponse.setResult(userService.getUserById(id));
        return apiResponse;
    }

    @PutMapping("/users/{id}")
    public ApiResponse<UserResponse> updateUser(@PathVariable String id, @RequestBody @Valid UpdateUserRequest updateUserRequest){
        ApiResponse<UserResponse> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("User has been updated successfully!");
        apiResponse.setResult(userService.updateUser(id, updateUserRequest));
        return apiResponse;
    }

    @DeleteMapping("/users/{id}")
    public ApiResponse<String> deleteUser(@PathVariable String id){
        ApiResponse<String> apiResponse = new ApiResponse<>();
        userService.deleteUser(id);
        apiResponse.setMessage("User has been deleted successfully!");
        return apiResponse;
    }

    @GetMapping("/my-info")
    public ApiResponse<UserResponse> getMyInfo(){
        ApiResponse<UserResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(userService.getMyInfo());
        return apiResponse;
    }

    @PutMapping("/my-info")
    public ApiResponse<UserResponse> updateMyInfo(@RequestBody @Valid UpdateUserRequest updateUserRequest) {
        ApiResponse<UserResponse> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Your information has been updated successfully!");
        apiResponse.setResult(userService.updateMyInfo(updateUserRequest));
        return apiResponse;
    }
}
