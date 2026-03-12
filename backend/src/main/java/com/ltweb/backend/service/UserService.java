package com.ltweb.backend.service;

import com.ltweb.backend.dto.request.CreateUserRequest;
import com.ltweb.backend.dto.response.UserResponse;
import com.ltweb.backend.exception.AppException;
import com.ltweb.backend.exception.ErrorCode;
import com.ltweb.backend.mapper.UserMapper;
import com.ltweb.backend.model.User;
import com.ltweb.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public UserResponse createUser(CreateUserRequest createUserRequest) {
        try {
            if (userRepository.existsByUsername(createUserRequest.getUsername())) {
                throw new AppException(ErrorCode.USERNAME_EXISTED);
            }
            if (userRepository.existsByEmail(createUserRequest.getEmail())) {
                throw new AppException(ErrorCode.EMAIL_EXISTED);
            }
            if (userRepository.existsByPhoneNumber(createUserRequest.getPhoneNumber())) {
                throw new AppException(ErrorCode.PHONENUMBER_EXISTED);
            }

            User user = userMapper.toUser(createUserRequest);
            user.setRole("USER");

            User savedUser = userRepository.save(user);
            return userMapper.toUserResponse(savedUser);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error creating user: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.INTERNAL_ERROR);
        }
    }



}
