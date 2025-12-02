package com.example.blogdulich.repository;

import com.example.blogdulich.entity.Blog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BlogRepository extends MongoRepository<Blog, String> {
    Page<Blog> findAllByAuthorId(String id, Pageable pageable);
    Page<Blog> findAllByIsPublicTrue(Pageable pageable);

    @Query(value = "{ 'isPublic': true, $or: [ " +
            "{ 'title': { $regex: ?0, $options: 'i' } }, " +
            "{ 'shortDescription': { $regex: ?0, $options: 'i' } }, " +
            "{ 'content': { $regex: ?0, $options: 'i' } } " +
            "] }")
    Page<Blog> searchPublicBlogs(String query, Pageable pageable);

    List<Blog> findTop3ByOrderByCreatedAtDesc();
    List<Blog> findTop4ByOrderByCreatedAtDesc();
}
