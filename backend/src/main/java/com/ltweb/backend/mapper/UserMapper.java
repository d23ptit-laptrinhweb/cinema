package com.ltweb.backend.mapper;

import com.ltweb.backend.dto.request.CreateUserRequest;
import com.ltweb.backend.dto.response.UserResponse;
import com.ltweb.backend.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "role", ignore = true)
    User toUser(CreateUserRequest request);

    UserResponse toUserResponse(User user);
}
