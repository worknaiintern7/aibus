package com.aibus.dto.admin.auth;

public class AdminAuthResponse {
    private String token;
    private AdminProfileResponse admin;

    public AdminAuthResponse() {
    }

    public AdminAuthResponse(String token, AdminProfileResponse admin) {
        this.token = token;
        this.admin = admin;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public AdminProfileResponse getAdmin() {
        return admin;
    }

    public void setAdmin(AdminProfileResponse admin) {
        this.admin = admin;
    }
}
