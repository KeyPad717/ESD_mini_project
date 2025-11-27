package com.esdproject.facultyupdate.repository;

import com.esdproject.facultyupdate.entity.FacultyCourse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FacultyCourseRepository extends JpaRepository<FacultyCourse, Integer> {
    List<FacultyCourse> findByFaculty_Id(Integer id);
    void deleteByFaculty_Id(Integer id);
    boolean existsByCourse_CourseIdAndFaculty_IdNot(Integer courseId, Integer facultyId);
}

