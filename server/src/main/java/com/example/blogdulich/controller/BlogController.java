package com.example.blogdulich.controller;

import com.example.blogdulich.dto.request.BlogUpdateStatusRequest;
import com.example.blogdulich.dto.response.ApiResponse;
import com.example.blogdulich.entity.Blog;
import com.example.blogdulich.service.BlogService;
import com.example.blogdulich.service.ImageService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/blog")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BlogController {
    BlogService blogService;

    @PostMapping()
    public Blog createBlog(
           @RequestParam String title,
           @RequestParam String shortDes,
           @RequestParam String content,
           @RequestParam MultipartFile file,
           @RequestParam String location
    )
    {
        return blogService.createBlog(title, shortDes, content, file, location);
    }

    @DeleteMapping("/{id}")
    public ApiResponse deleteBlog(@PathVariable String id) {
        var result = blogService.deleteBlog(id);
        if (result) {
            return ApiResponse.builder().result("Blog has been removed!").build();
        }
        else {
            return ApiResponse.builder().result("Blog has not been removed!").build();
        }
    }

    @PutMapping("/{id}")
    public Blog editBlog(
            @PathVariable String id,
            @RequestParam String title,
            @RequestParam String shortDes,
            @RequestParam String content,
            @RequestParam(required = false) MultipartFile file,
            @RequestParam Boolean isPublic,
            @RequestParam String location
    ){
        return blogService.editBlog(id,title, shortDes, content, file, isPublic, location);
    }

    @PutMapping("/status")
    public Blog editBlog(@RequestBody BlogUpdateStatusRequest request){
        return blogService.updateStatus(request);
    }

    @GetMapping()
    public Page<Blog> getMyBlog(Pageable pageable) {
        return blogService.getMyAllBlog(pageable);
    }

    @GetMapping("/{id}")
    public Blog getBlog(@PathVariable String id) {
        return blogService.getBlog(id);
    }

    @GetMapping("/public")
    public Page<Blog> getAllPublicBlog(Pageable pageable, @RequestParam(required = false) String query) {
        System.out.println(query);
        return blogService.getAllPublicBlog(pageable, query);
    }

    @GetMapping("/newest")
    public List<Blog> getTop3LatestBlog(){
        return blogService.getTop3LatestBlog();
    }
}
