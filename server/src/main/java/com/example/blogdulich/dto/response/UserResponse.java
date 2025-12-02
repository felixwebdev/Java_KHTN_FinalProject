package com.example.blogdulich.dto.response;

import com.example.blogdulich.enums.ROLE;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@NonNull
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {
    String id;
    String email;
    String displayName;
    String avatar;
    Set<String> roles;
    String dob;
    Date createdAt;
}
