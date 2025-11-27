package com.esdproject.facultyupdate.service;

import com.esdproject.facultyupdate.entity.Course;
import com.esdproject.facultyupdate.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }
}

