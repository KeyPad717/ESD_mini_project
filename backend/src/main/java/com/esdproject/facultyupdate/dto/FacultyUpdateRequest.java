package com.esdproject.facultyupdate.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class FacultyUpdateRequest {
    
    @NotNull(message = "ID is required for update")
    private Integer id;  // Surrogate key for lookup
    
    private String employeeId;  // User-facing employee identifier (mutable)
    
    @NotBlank(message = "First name is required")
    private String firstName;
    
    private String lastName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String photographPath;
    
    @NotNull(message = "Department ID is required")
    private Integer departmentId;
    
    private List<Integer> courseIds;
}

