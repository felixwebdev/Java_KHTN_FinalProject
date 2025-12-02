package com.example.blogdulich.service;

import com.example.blogdulich.dto.request.AuthenticationRequest;
import com.example.blogdulich.dto.request.UserCreationRequest;
import com.example.blogdulich.dto.response.UserResponse;
import com.example.blogdulich.entity.User;
import com.example.blogdulich.enums.ROLE;
import com.example.blogdulich.exception.AppException;
import com.example.blogdulich.exception.ErrorCode;
import com.example.blogdulich.mapper.UserMapper;
import com.example.blogdulich.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashSet;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService {
    UserRepository userRepository;
    PasswordEncoder passwordEncoder;
    UserMapper userMapper;

    public UserResponse createUser(UserCreationRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        User user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        HashSet<String> roles = new HashSet<>();
        roles.add(ROLE.USER.name());
        user.setRoles(roles);
        user.setAvatar("https://res.cloudinary.com/desoarfu8/image/upload/v1759670502/samples/man-portrait.jpg");
        user.setCreatedAt(new Date());

        User savedUser = userRepository.save(user);

        return userMapper.toDto(savedUser);
    }
    public UserResponse getMyInfo() {
        var context = SecurityContextHolder.getContext();
        var email = context.getAuthentication().getName();

        User user = userRepository.findUserByEmail(email).orElseThrow(()->{throw new AppException(ErrorCode.USER_NOT_FOUND);});
        return userMapper.toDto(user);
    }

    public UserResponse getUser(String id) {
        User user = userRepository.findById(id).orElseThrow(()->{throw new AppException(ErrorCode.USER_NOT_FOUND);});
        return userMapper.toDto(user);
    }
}
