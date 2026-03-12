package com.ltweb.backend.service;

import com.ltweb.backend.dto.request.CreateUserRequest;
import com.ltweb.backend.dto.request.UpdateUserRequest;
import com.ltweb.backend.dto.response.UserResponse;
import com.ltweb.backend.exception.AppException;
import com.ltweb.backend.exception.ErrorCode;
import com.ltweb.backend.mapper.UserMapper;
import com.ltweb.backend.model.User;
import com.ltweb.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

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

    public List<UserResponse> getAllUser(){
        return userRepository.findAll().stream()
            .map(user -> {UserResponse userResponse = userMapper.toUserResponse(user);
                return userResponse;
            })
            .toList();
    }

    public UserResponse updateUser(String id, UpdateUserRequest updateUserRequest){
        User user = userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        userMapper.updateUser(user, updateUserRequest);
        return userMapper.toUserResponse(userRepository.save(user));
    }

    public void deleteUser(String id){
        User user = userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        userRepository.delete(user);
    }

}
