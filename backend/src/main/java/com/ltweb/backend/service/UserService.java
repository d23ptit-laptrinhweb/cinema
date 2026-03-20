package com.ltweb.backend.service;

import com.ltweb.backend.dto.request.CreateUserRequest;
import com.ltweb.backend.dto.request.UpdateUserRequest;
import com.ltweb.backend.dto.response.UserResponse;
import com.ltweb.backend.entity.User;
import com.ltweb.backend.enums.UserRole;
import com.ltweb.backend.enums.UserStatus;
import com.ltweb.backend.exception.AppException;
import com.ltweb.backend.exception.ErrorCode;
import com.ltweb.backend.mapper.UserMapper;
import com.ltweb.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Objects;

import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserResponse createUser(CreateUserRequest createUserRequest) {
        User user = userMapper.toUser(createUserRequest);
        user.setRole(UserRole.USER);
        user.setStatus(UserStatus.ACTIVE);
        user.setPassword(passwordEncoder.encode(createUserRequest.getPassword()));
        User savedUser = userRepository.save(user);
        return userMapper.toUserResponse(savedUser);  
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> getAllUser(){
        return userRepository.findAll().stream()
            .map(userMapper::toUserResponse)
            .toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse getUserById(String id){
        User user = userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return userMapper.toUserResponse(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse updateUser(String id, UpdateUserRequest updateUserRequest){
        User user = userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        userMapper.updateUser(user, updateUserRequest);
        return userMapper.toUserResponse(userRepository.save(user));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(String id){
        User user = userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        userRepository.delete(user);
    }

    @PostAuthorize("returnObject.username == authentication.name")
    public UserResponse getMyInfo(){
        var context = SecurityContextHolder.getContext();
        String name = Objects.requireNonNull(context.getAuthentication()).getName();
        User user = userRepository.findByUsername(name).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return userMapper.toUserResponse(user);
    }

    @PostAuthorize("returnObject.username == authentication.name")
    public UserResponse updateMyInfo(UpdateUserRequest updateUserRequest){
        var context = SecurityContextHolder.getContext();
        String name = Objects.requireNonNull(context.getAuthentication()).getName();
        User user = userRepository.findByUsername(name).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        userMapper.updateUser(user, updateUserRequest);
        return userMapper.toUserResponse(userRepository.save(user));
     }

}
