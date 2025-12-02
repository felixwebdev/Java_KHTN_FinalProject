package com.example.blogdulich.entity;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Data
@Document(collection = "blogs")
@FieldDefaults(level = AccessLevel.PRIVATE)
@AllArgsConstructor
@NoArgsConstructor
public class Blog {
    @Id
    String id;

    String title;
    String shortDescription;
    String content;

    String location;
    Boolean isPublic;
    String authorId;
    String authorName;

    String img;
    String imgId;

    Date createdAt = new Date();
    Date updatedAt = new Date();

    long views = 0;
}
