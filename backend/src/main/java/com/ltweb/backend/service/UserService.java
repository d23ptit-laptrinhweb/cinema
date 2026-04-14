package com.ltweb.backend.service;

import com.ltweb.backend.dto.request.CreateUserRequest;
import com.ltweb.backend.dto.request.UpdateMyInfoRequest;
import com.ltweb.backend.dto.request.UpdateUserRequest;
import com.ltweb.backend.dto.response.PageResponse;
import com.ltweb.backend.dto.response.UserResponse;
import com.ltweb.backend.entity.User;
import com.ltweb.backend.enums.Gender;
import com.ltweb.backend.enums.UserRole;
import com.ltweb.backend.enums.UserStatus;
import com.ltweb.backend.exception.AppException;
import com.ltweb.backend.exception.ErrorCode;
import com.ltweb.backend.mapper.UserMapper;
import com.ltweb.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Objects;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserResponse createUser(CreateUserRequest createUserRequest) {
        if(userRepository.existsByUsername(createUserRequest.getUsername())){
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        if(userRepository.existsByEmail(createUserRequest.getEmail())){
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        User user = userMapper.toUser(createUserRequest);
        user.setRole(UserRole.USER);
        user.setStatus(UserStatus.ACTIVE);
        user.setPassword(passwordEncoder.encode(createUserRequest.getPassword()));
        User savedUser = userRepository.save(user);
        return userMapper.toUserResponse(savedUser);  
    }

    @PreAuthorize("hasRole('ADMIN')")
    public PageResponse<List<UserResponse>> searchUsers(String username, String email, String phone, Pageable pageable){
        Specification<User> specification = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(username)) {
                predicates.add(
                    criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("username")),
                        "%" + username.trim().toLowerCase() + "%"
                    )
                );
            }

            if (StringUtils.hasText(email)) {
                predicates.add(
                    criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("email")),
                        "%" + email.trim().toLowerCase() + "%"
                    )
                );
            }

            if (StringUtils.hasText(phone)) {
                predicates.add(
                    criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("phoneNumber")),
                        "%" + phone.trim().toLowerCase() + "%"
                    )
                );
            }

            return predicates.isEmpty()
                ? criteriaBuilder.conjunction()
                : criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        var usersPage = userRepository.findAll(specification, pageable)
            .map(userMapper::toUserResponse);

        return new PageResponse<>(
            usersPage.getContent(),
            usersPage.getNumber() + 1,
            usersPage.getSize(),
            usersPage.getTotalElements(),
            usersPage.getTotalPages()
        );
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

    @Transactional
    @PostAuthorize("returnObject.username == authentication.name")
    public UserResponse updateMyInfo(UpdateMyInfoRequest updateMyInfoRequest){
        var context = SecurityContextHolder.getContext();
        String name = Objects.requireNonNull(context.getAuthentication()).getName();
        User user = userRepository.findByUsername(name).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (StringUtils.hasText(updateMyInfoRequest.getFullName())) {
            user.setFullName(updateMyInfoRequest.getFullName().trim());
        }

        if (updateMyInfoRequest.getDob() != null) {
            user.setDob(updateMyInfoRequest.getDob());
        }

        if (StringUtils.hasText(updateMyInfoRequest.getPhoneNumber())) {
            user.setPhoneNumber(updateMyInfoRequest.getPhoneNumber().trim());
        }

        if (StringUtils.hasText(updateMyInfoRequest.getEmail())) {
            String email = updateMyInfoRequest.getEmail().trim().toLowerCase();
            if (!email.equalsIgnoreCase(user.getEmail()) && userRepository.existsByEmail(email)) {
                throw new AppException(ErrorCode.USER_EXISTED);
            }
            user.setEmail(email);
        }

        if (StringUtils.hasText(updateMyInfoRequest.getGender())) {
            try {
                user.setGender(Gender.valueOf(updateMyInfoRequest.getGender().trim().toUpperCase()));
            } catch (IllegalArgumentException ex) {
                throw new AppException(ErrorCode.VALIDATION_ERROR);
            }
        }

        return userMapper.toUserResponse(userRepository.save(user));
     }

}
