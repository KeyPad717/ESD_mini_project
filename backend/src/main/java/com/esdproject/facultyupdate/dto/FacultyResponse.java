package com.esdproject.facultyupdate.dto;

import lombok.Data;

import java.util.List;

@Data
public class FacultyResponse {
    private Integer id;  // Surrogate key
    private String employeeId;  // User-facing employee identifier
    private String firstName;
    private String lastName;
    private String email;
    private String title;
    private String photographPath;
    private DepartmentDto department;
    private List<CourseDto> courses;
    
    @Data
    public static class DepartmentDto {
        private Integer departmentId;
        private String name;
        private Integer capacity;
    }
    
    @Data
    public static class CourseDto {
        private Integer courseId;
        private String courseCode;
        private String name;
        private String description;
        private Integer credits;
    }
}

