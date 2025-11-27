package com.esdproject.facultyupdate.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "faculty_courses", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"faculty", "course_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FacultyCourse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "faculty", nullable = false)
    @JsonIgnore  // Prevent circular reference
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private Employee faculty;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
}

