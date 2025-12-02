package com.example.blogdulich.controller;

import com.example.blogdulich.dto.request.CommentCreationRequest;
import com.example.blogdulich.entity.Comment;
import com.example.blogdulich.service.CommentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comment")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CommentController {
    CommentService commentService;

    @PostMapping()
    public Comment createComment(@RequestBody CommentCreationRequest request) {
        return commentService.createCmt(request);
    }

    @GetMapping("/{blogId}")
    public List<Comment> getBLogComment(@PathVariable String blogId) {
        return commentService.getBlogCmt(blogId);
    }
}
