package com.example.blogdulich.dto.request;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BlogCreationRequest {
    String title;
    String shortDescription;
    String content;

    List<String> images;
    String location;
    Boolean isPublic;
    String authorId;
    String authorName;
}
