package com.example.blogdulich.service;

import com.example.blogdulich.dto.request.BlogUpdateStatusRequest;
import com.example.blogdulich.entity.Blog;
import com.example.blogdulich.entity.Image;
import com.example.blogdulich.entity.User;
import com.example.blogdulich.exception.AppException;
import com.example.blogdulich.exception.ErrorCode;
import com.example.blogdulich.repository.BlogRepository;
import com.example.blogdulich.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BlogService {
    BlogRepository blogRepository;
    ImageService imageService;
    UserRepository userRepository;

    public Blog createBlog(
            String title,
            String shortDes,
            String content,
            MultipartFile file,
            String location)
    {
        var context = SecurityContextHolder.getContext();
        String email = context.getAuthentication().getName();
        User user = userRepository.findUserByEmail(email).orElseThrow(()->{throw new AppException(ErrorCode.USER_NOT_FOUND);});

        Blog blog = new Blog();

        blog.setTitle(title);
        blog.setShortDescription(shortDes);
        blog.setAuthorId(user.getId());
        blog.setIsPublic(true);
        blog.setAuthorName(user.getDisplayName());
        blog.setContent(content);
        blog.setLocation(location);

        if (!file.isEmpty()) {
            Image img = imageService.uploadImage("",file);
            blog.setImg(img.getUrl());
            blog.setImgId(img.getId());
        }

        return blogRepository.save(blog);
    }

    public Blog editBlog(String id,
                         String title,
                         String shortDes,
                         String content,
                         MultipartFile file,
                         Boolean status,
                         String location)
    {
        Blog blog = blogRepository.findById(id).orElseThrow(()->{throw new AppException(ErrorCode.BLOG_NOT_FOUND);});
        blog.setTitle(title);
        blog.setShortDescription(shortDes);
        blog.setContent(content);
        blog.setIsPublic(status);
        blog.setLocation(location);

        if (file != null && !file.isEmpty()) {
            Image img = imageService.uploadImage("",file);
            blog.setImg(img.getUrl());
            blog.setImgId(img.getId());
        }

        Blog savedBlog = blogRepository.save(blog);

        return savedBlog;
    }

    public boolean deleteBlog(String id) {
        Blog blog = blogRepository.findById(id).orElseThrow(()->{
            throw new AppException(ErrorCode.BLOG_NOT_FOUND);
        });

        boolean deleteImg = imageService.deleteImage(blog.getImgId());
        if (deleteImg) {
            blogRepository.delete(blog);
            return true;
        }
        else {
            return false;
        }
    }

    public Page<Blog> getMyAllBlog(Pageable pageable){
        var context = SecurityContextHolder.getContext();
        String email = context.getAuthentication().getName();
        User user = userRepository.findUserByEmail(email).orElseThrow(()->{throw new AppException(ErrorCode.USER_NOT_FOUND);});

        return blogRepository.findAllByAuthorId(user.getId(), pageable);
    }

    public Page<Blog> getAllPublicBlog(Pageable pageable, String query) {
        if (query != null && !query.isBlank()) {
            return blogRepository.searchPublicBlogs(query, pageable);
        }

        return blogRepository.findAllByIsPublicTrue(pageable);
    }


    public Blog getBlog(String id) {
        return blogRepository.findById(id).orElseThrow(()->{throw new AppException(ErrorCode.BLOG_NOT_FOUND);});
    }

    public List<Blog> getTop3LatestBlog() {
        return blogRepository.findTop3ByOrderByCreatedAtDesc();
    }

    public Blog updateStatus(BlogUpdateStatusRequest request) {
        Blog blog = blogRepository.findById(request.getId()).orElseThrow(()->{throw new AppException(ErrorCode.BLOG_NOT_FOUND);});
        if (request.getStatus() != blog.getIsPublic()) {
            blog.setIsPublic(request.getStatus());
        }
        return blogRepository.save(blog);
    }
}
