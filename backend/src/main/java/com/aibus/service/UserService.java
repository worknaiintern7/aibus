package com.aibus.service;

import com.aibus.dto.user.UpdateUserRequest;
import com.aibus.dto.user.UserResponse;
import com.aibus.entity.User;
import com.aibus.exception.ResourceNotFoundException;
import com.aibus.mapper.UserMapper;
import com.aibus.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public UserService(UserRepository userRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }

    public Optional<User> findByMobile(String mobile) {
        return userRepository.findByMobile(mobile);
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    @Transactional
    public User findOrCreateUser(String mobile) {
        Optional<User> existingUser = userRepository.findByMobile(mobile);
        if (existingUser.isPresent()) {
            return existingUser.get();
        }
        User newUser = new User();
        newUser.setMobile(mobile);
        newUser.setName("AIBus User");
        return userRepository.save(newUser);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return userMapper.toUserResponse(user);
    }

    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setName(request.getName());
        User updated = userRepository.save(user);
        return userMapper.toUserResponse(updated);
    }
}