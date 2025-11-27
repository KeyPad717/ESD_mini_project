package com.esdproject.facultyupdate.controller;

import com.esdproject.facultyupdate.dto.ApiResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class AuthController {

    @GetMapping("/user")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentUser(
            @AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return ResponseEntity.ok(ApiResponse.error("Not authenticated"));
        }
        
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("name", principal.getAttribute("name"));
        userInfo.put("email", principal.getAttribute("email"));
        userInfo.put("picture", principal.getAttribute("picture"));
        
        return ResponseEntity.ok(ApiResponse.success(userInfo));
    }

    @GetMapping("/success")
    public ResponseEntity<ApiResponse<Map<String, String>>> loginSuccess() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Login successful");
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/failure")
    public ResponseEntity<ApiResponse<Map<String, String>>> loginFailure() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Login failed");
        return ResponseEntity.status(401).body(ApiResponse.error("Login failed"));
    }

}
