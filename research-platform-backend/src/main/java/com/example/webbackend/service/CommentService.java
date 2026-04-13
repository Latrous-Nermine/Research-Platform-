package com.example.webbackend.service;

import com.example.webbackend.entity.Comment;
import com.example.webbackend.entity.User;
import com.example.webbackend.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CommentService {
    private final CommentRepository commentRepository;

    @Autowired
    public CommentService(CommentRepository commentRepository) {
        this.commentRepository = commentRepository;
    }

    public List<Map<String, Object>> getCommentsByPublication(Long publicationId) {
        List<Comment> comments = commentRepository.findByPublicationId(publicationId);
        return comments.stream()
                .map(comment -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", comment.getId());
                    map.put("content", comment.getContent());
                    map.put("createdAt",comment.getCreatedAt());
                    map.put("user",comment.getUser());
                    return map;
                })
                .collect(Collectors.toList());
    }

    public Comment createComment(Comment comment) {
        return commentRepository.save(comment);
    }


    public Comment getCommentById(Long id) {
        return commentRepository.findById(id).orElseThrow(() -> new RuntimeException("Commentaire non trouvé"));
    }

    public Comment updateComment(Comment commentDetails) {
            return commentRepository.save(commentDetails);    }

    public void deleteComment(Long id) {
        commentRepository.deleteById(id);
    }
}
