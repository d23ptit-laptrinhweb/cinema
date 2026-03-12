package com.ltweb.backend.mapper;

import com.ltweb.backend.dto.request.CreateUserRequest;
import com.ltweb.backend.dto.request.UpdateUserRequest;
import com.ltweb.backend.dto.response.UserResponse;
import com.ltweb.backend.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "role", ignore = true)
    User toUser(CreateUserRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "username", ignore = true)
    void updateUser(@MappingTarget User user, UpdateUserRequest request);

    UserResponse toUserResponse(User user);
}
