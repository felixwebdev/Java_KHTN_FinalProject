package com.example.blogdulich.mapper;

import com.example.blogdulich.dto.request.UserCreationRequest;
import com.example.blogdulich.dto.response.UserResponse;
import com.example.blogdulich.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toEntity(UserCreationRequest request);
    UserResponse toDto(User user);
}
