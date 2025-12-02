package com.example.blogdulich.entity;

import com.example.blogdulich.enums.ROLE;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.Set;

@Data
@Builder
@Document(collection = "users")
@FieldDefaults(level = AccessLevel.PRIVATE)
@AllArgsConstructor
@NoArgsConstructor
public class User {
    @Id
    String id;
    String email;
    String password;
    String displayName;
    String avatar;
    Set<String> roles;
    String status;
    String dob;
    Date createdAt;
}
