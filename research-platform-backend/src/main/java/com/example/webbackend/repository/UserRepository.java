package com.example.webbackend.repository;

import com.example.webbackend.entity.User;
import com.example.webbackend.enumerates.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    @Query("select u from User u where u.email =?1")
    public List<User> getUserByEmail(String email);
    @Query("select u from User u where u.role =?1")
    public List<User> getUsersByRole(Role role);
}
