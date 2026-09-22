package com.aibus.dto.user;

public class UserResponse {
    private Long id;
    private String mobile;
    private String name;

    public UserResponse() {
    }

    public UserResponse(Long id, String mobile, String name) {
        this.id = id;
        this.mobile = mobile;
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
