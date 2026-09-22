package com.aibus.mapper;

import com.aibus.dto.user.UserResponse;
import com.aibus.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toUserResponse(User user) {
        if (user == null) {
            return null;
        }
        return new UserResponse(user.getId(), user.getMobile(), user.getName());
    }
}
