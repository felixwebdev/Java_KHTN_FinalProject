package com.example.blogdulich.controller;


import com.example.blogdulich.dto.response.ApiResponse;
import com.example.blogdulich.entity.Image;
import com.example.blogdulich.service.ImageService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/image")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ImageController {
    ImageService imageService;

    @PostMapping()
    public Image uploadImage(
            @RequestParam String userId,
            @RequestParam MultipartFile file
    ) {
        return imageService.uploadImage(userId, file);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<?> deleteImage(@PathVariable String id) {
        boolean deleted = imageService.deleteImage(id);
        if (deleted) {
            return ApiResponse.builder()
                    .message("Delete image successfull")
                    .build();
        } else {
            return ApiResponse.builder()
                    .code(500)
                    .message("Delete image fail")
                    .build();
        }
    }
}
