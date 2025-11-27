package com.esdproject.facultyupdate.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class FacultyRegistrationRequest {
    
    private String employeeId;  // Optional user-facing employee identifier
    
    @NotBlank(message = "First name is required")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    private String lastName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
    
    private String title;
    
    private String photographPath;
    
    @NotNull(message = "Department ID is required")
    private Integer departmentId;
    
    private List<Integer> courseIds;
}

