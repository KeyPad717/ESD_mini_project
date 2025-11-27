package com.esdproject.facultyupdate.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {

    /**
     * Get the email of the currently authenticated user from OAuth2
     * @return Email of the authenticated user
     * @throws IllegalStateException if user is not authenticated or email not found
     */
    public String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("User is not authenticated");
        }
        
        Object principal = authentication.getPrincipal();
        
        if (principal instanceof OAuth2User) {
            OAuth2User oauth2User = (OAuth2User) principal;
            String email = oauth2User.getAttribute("email");
            
            if (email == null || email.isEmpty()) {
                throw new IllegalStateException("Email not found in OAuth2 user attributes");
            }
            
            return email;
        }
        
        throw new IllegalStateException("Principal is not an OAuth2User");
    }
    
    /**
     * Check if a user is currently authenticated
     * @return true if authenticated, false otherwise
     */
    public boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated();
    }
}
