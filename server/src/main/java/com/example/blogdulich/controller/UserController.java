package com.example.blogdulich.controller;

import com.example.blogdulich.dto.request.AuthenticationRequest;
import com.example.blogdulich.dto.request.IntrospectRequest;
import com.example.blogdulich.dto.request.UserCreationRequest;
import com.example.blogdulich.dto.response.ApiResponse;
import com.example.blogdulich.dto.response.AuthenticationResponse;
import com.example.blogdulich.dto.response.IntrospectResponse;
import com.example.blogdulich.dto.response.UserResponse;
import com.example.blogdulich.service.AuthenticationService;
import com.example.blogdulich.service.UserService;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.KeyLengthException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;

@RestController
@RequestMapping("api/user")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {
    UserService userService;
    AuthenticationService authenticationService;

    @PostMapping()
    public UserResponse createUser(@RequestBody UserCreationRequest request) {
        return userService.createUser(request);
    }

    @PostMapping("/signin")
    public ApiResponse<AuthenticationResponse>authenticate (@RequestBody AuthenticationRequest request)
            throws KeyLengthException {
        AuthenticationResponse result = authenticationService.authenticate(request);
        return ApiResponse.<AuthenticationResponse>builder()
                .result(result)
                .build();
    }

    @PostMapping("/introspect")
    public ApiResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest request)
            throws ParseException, JOSEException {
        var result = authenticationService.introspect(request);
        return ApiResponse.<IntrospectResponse>builder()
                .result(result)
                .build();
    }

    @GetMapping("/me")
    public UserResponse myInfo() {
        return userService.getMyInfo();
    }

    @GetMapping("/{id}")
    public UserResponse getUserById(@PathVariable String id) {
        return userService.getUser(id);
    }
}
