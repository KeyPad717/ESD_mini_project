package com.esdproject.facultyupdate.repository;

import com.esdproject.facultyupdate.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Integer> {
    List<Course> findByCourseCodeIn(List<String> courseCodes);
}

