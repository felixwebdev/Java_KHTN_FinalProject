package com.example.blogdulich.service;

import com.example.blogdulich.dto.request.CommentCreationRequest;
import com.example.blogdulich.entity.Comment;
import com.example.blogdulich.entity.User;
import com.example.blogdulich.exception.AppException;
import com.example.blogdulich.exception.ErrorCode;
import com.example.blogdulich.repository.CommentRepository;
import com.example.blogdulich.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CommentService {
    CommentRepository commentRepository;
    UserRepository userRepository;

    public Comment createCmt(CommentCreationRequest request) {
        Comment comment = new Comment();
        comment.setBlogId(request.getBlogId());

        var context = SecurityContextHolder.getContext();
        var email = context.getAuthentication().getName();
        User user = userRepository.findUserByEmail(email).orElseThrow(()->{throw new AppException(ErrorCode.USER_NOT_FOUND);});

        comment.setUserId(user.getId());
        comment.setUserAvatar(user.getAvatar());
        comment.setUserName(user.getDisplayName());
        comment.setContent(request.getContent());

        return commentRepository.save(comment);
    }

    public List<Comment> getBlogCmt(String blogId) {
        return commentRepository.findByBlogId(blogId);
    }
}
