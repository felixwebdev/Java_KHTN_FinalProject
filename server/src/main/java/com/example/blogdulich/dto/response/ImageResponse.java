package com.example.blogdulich.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@NonNull
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ImageResponse {
    String id;
    String blogId;
    String publicId;
    String url;
    String userId;
}
