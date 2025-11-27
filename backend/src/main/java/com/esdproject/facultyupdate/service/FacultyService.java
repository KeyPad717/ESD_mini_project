package com.esdproject.facultyupdate.service;

import com.esdproject.facultyupdate.dto.FacultyRegistrationRequest;
import com.esdproject.facultyupdate.dto.FacultyResponse;
import com.esdproject.facultyupdate.dto.FacultyUpdateRequest;
import com.esdproject.facultyupdate.entity.Course;
import com.esdproject.facultyupdate.entity.Department;
import com.esdproject.facultyupdate.entity.Employee;
import com.esdproject.facultyupdate.entity.FacultyCourse;
import com.esdproject.facultyupdate.exception.ResourceNotFoundException;
import com.esdproject.facultyupdate.repository.CourseRepository;
import com.esdproject.facultyupdate.repository.DepartmentRepository;
import com.esdproject.facultyupdate.repository.EmployeeRepository;
import com.esdproject.facultyupdate.repository.FacultyCourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FacultyService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final CourseRepository courseRepository;
    private final FacultyCourseRepository facultyCourseRepository;
    private final FileStorageService fileStorageService;
    private final AuthenticationService authenticationService;
    private final jakarta.persistence.EntityManager entityManager;

    @Transactional
    public FacultyResponse updateFaculty(FacultyUpdateRequest request) {
        // Find employee by surrogate id
        Employee employee = employeeRepository.findById(request.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + request.getId()));

        // Check if email is being changed and if new email already exists
        if (!employee.getEmail().equalsIgnoreCase(request.getEmail().trim())) {
            if (employeeRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Email already exists: " + request.getEmail());
            }
            employee.setEmail(request.getEmail());
        }

        // Find department
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + request.getDepartmentId()));

        // Update employee details
        if (request.getEmployeeId() != null) {
            employee.setEmployeeId(request.getEmployeeId());
        }
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setTitle(request.getTitle());
        employee.setDepartment(department);

        // Update photograph path if provided
        if (request.getPhotographPath() != null && !request.getPhotographPath().isEmpty()) {
            // Delete old photograph if exists
            if (employee.getPhotographPath() != null) {
                try {
                    fileStorageService.deleteFile(employee.getPhotographPath());
                } catch (Exception e) {
                    // Log error but continue
                }
            }
            employee.setPhotographPath(request.getPhotographPath());
        }

        // Update courses
        if (request.getCourseIds() != null) {
            try {
                // 1. Clear faculty name from previously assigned courses
                List<FacultyCourse> existingAssociations = facultyCourseRepository.findByFaculty_Id(employee.getId());
                for (FacultyCourse fc : existingAssociations) {
                    Course course = fc.getCourse();
                    course.setFaculty(null);
                    courseRepository.save(course);
                }

                // Remove existing course associations
                facultyCourseRepository.deleteByFaculty_Id(employee.getId());
                employee.getCourses().clear();
                
                // Flush to ensure deletions are committed before inserts
                entityManager.flush();

                // Add new course associations
                if (!request.getCourseIds().isEmpty()) {
                    List<Course> courses = courseRepository.findAllById(request.getCourseIds());
                    if (courses.size() != request.getCourseIds().size()) {
                        throw new ResourceNotFoundException("One or more courses not found. Expected " + request.getCourseIds().size() + " but found " + courses.size());
                    }

                    // Validate that courses are not taken by other faculty
                    for (Course course : courses) {
                        if (facultyCourseRepository.existsByCourse_CourseIdAndFaculty_IdNot(course.getCourseId(), employee.getId())) {
                            throw new IllegalArgumentException("Course '" + course.getName() + "' (" + course.getCourseCode() + ") is already assigned to another faculty member.");
                        }
                    }

                    String facultyName = employee.getFirstName() + " " + employee.getLastName();

                    for (Course course : courses) {
                        // Create association
                        FacultyCourse facultyCourse = new FacultyCourse();
                        facultyCourse.setFaculty(employee);
                        facultyCourse.setCourse(course);
                        employee.getCourses().add(facultyCourse);
                        
                        // 2. Update faculty name in course table
                        course.setFaculty(facultyName);
                        courseRepository.save(course);
                    }
                }
            } catch (Exception e) {
                throw new RuntimeException("Failed to update courses: " + e.getMessage(), e);
            }
        }

        // Save employee (cascade will handle courses)
        employee = employeeRepository.save(employee);

        return mapToResponse(employee);
    }

    @Transactional
    public FacultyResponse registerFaculty(FacultyRegistrationRequest request) {
        // Check if email already exists
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + request.getEmail());
        }

        // Find department
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + request.getDepartmentId()));

        // Create new employee
        Employee employee = new Employee();
        if (request.getEmployeeId() != null) {
            employee.setEmployeeId(request.getEmployeeId());
        }
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());
        employee.setTitle(request.getTitle());
        employee.setPhotographPath(request.getPhotographPath());
        employee.setDepartment(department);

        // Save employee first to get ID
        employee = employeeRepository.save(employee);

        // Add courses if provided
        if (request.getCourseIds() != null && !request.getCourseIds().isEmpty()) {
            List<Course> courses = courseRepository.findAllById(request.getCourseIds());
            if (courses.size() != request.getCourseIds().size()) {
                throw new ResourceNotFoundException("One or more courses not found");
            }

            for (Course course : courses) {
                FacultyCourse facultyCourse = new FacultyCourse();
                facultyCourse.setFaculty(employee);
                facultyCourse.setCourse(course);
                employee.getCourses().add(facultyCourse);
            }
            employee = employeeRepository.save(employee);
        }

        return mapToResponse(employee);
    }

    /**
     * Get the current authenticated faculty member's profile
     * @return FacultyResponse with current user's data
     * @throws ResourceNotFoundException if email not found in employees table
     */
    public FacultyResponse getCurrentFacultyProfile() {
        String email = authenticationService.getCurrentUserEmail();
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "User not found. Your email (" + email + ") is not registered in the system. Please contact administrator."));
        return mapToResponse(employee);
    }

    /**
     * Update the current authenticated faculty member's profile
     * @param request Update request with new data
     * @return Updated FacultyResponse
     * @throws ResourceNotFoundException if email not found
     */
    @Transactional
    public FacultyResponse updateCurrentFacultyProfile(FacultyUpdateRequest request) {
        String email = authenticationService.getCurrentUserEmail();
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "User not found. Your email is not registered in the system."));
        
        // Override the ID in request with the current user's ID to prevent tampering
        request.setId(employee.getId());
        
        return updateFaculty(request);
    }

    public FacultyResponse getFacultyById(Integer employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + employeeId));
        return mapToResponse(employee);
    }

    public List<FacultyResponse> getAllFaculty() {
        return employeeRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteFaculty(Integer employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + employeeId));

        // Delete photograph if exists
        if (employee.getPhotographPath() != null) {
            try {
                fileStorageService.deleteFile(employee.getPhotographPath());
            } catch (Exception e) {
                // Log error but continue
            }
        }

        employeeRepository.delete(employee);
    }

    private FacultyResponse mapToResponse(Employee employee) {
        FacultyResponse response = new FacultyResponse();
        response.setId(employee.getId());
        response.setEmployeeId(employee.getEmployeeId());
        response.setFirstName(employee.getFirstName());
        response.setLastName(employee.getLastName());
        response.setEmail(employee.getEmail());
        response.setTitle(employee.getTitle());
        response.setPhotographPath(employee.getPhotographPath());

        if (employee.getDepartment() != null) {
            FacultyResponse.DepartmentDto deptDto = new FacultyResponse.DepartmentDto();
            deptDto.setDepartmentId(employee.getDepartment().getDepartmentId());
            deptDto.setName(employee.getDepartment().getName());
            deptDto.setCapacity(employee.getDepartment().getCapacity());
            response.setDepartment(deptDto);
        }

        if (employee.getCourses() != null) {
            List<FacultyResponse.CourseDto> courseDtos = employee.getCourses().stream()
                    .map(fc -> {
                        FacultyResponse.CourseDto courseDto = new FacultyResponse.CourseDto();
                        Course course = fc.getCourse();
                        courseDto.setCourseId(course.getCourseId());
                        courseDto.setCourseCode(course.getCourseCode());
                        courseDto.setName(course.getName());
                        courseDto.setDescription(course.getDescription());
                        courseDto.setCredits(course.getCredits());
                        return courseDto;
                    })
                    .collect(Collectors.toList());
            response.setCourses(courseDtos);
        }

        return response;
    }
}

