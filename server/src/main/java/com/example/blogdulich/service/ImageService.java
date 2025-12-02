package com.example.blogdulich.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.blogdulich.entity.Image;
import com.example.blogdulich.repository.ImageRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Date;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ImageService {
    Cloudinary cloudinary;
    ImageRepository imageRepository;

    public Image uploadImage(String userId, MultipartFile file) {
        try {
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap("folder", "blog_images")
            );

            String url = uploadResult.get("secure_url").toString();
            String publicId = uploadResult.get("public_id").toString();

            Image img = new Image();
            img.setUserId(userId);
            img.setUrl(url);
            img.setPublicId(publicId);

            return imageRepository.save(img);

        } catch (Exception e) {
            throw new RuntimeException("Upload ảnh thất bại: " + e.getMessage());
        }
    }

    public boolean deleteImage(String imageId) {
        Image image = imageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ảnh với id: " + imageId));

        try {
            Map result = cloudinary.uploader().destroy(image.getPublicId(), ObjectUtils.emptyMap());

            if ("ok".equals(result.get("result"))) {
                imageRepository.deleteById(imageId);
                return true;
            } else {
                throw new RuntimeException("Xóa ảnh trên Cloudinary thất bại: " + result.get("result"));
            }

        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi xóa ảnh: " + e.getMessage());
        }
    }
}
