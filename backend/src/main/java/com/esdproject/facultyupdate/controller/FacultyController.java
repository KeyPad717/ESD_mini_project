package com.esdproject.facultyupdate.controller;

import com.esdproject.facultyupdate.dto.ApiResponse;
import com.esdproject.facultyupdate.dto.FacultyRegistrationRequest;
import com.esdproject.facultyupdate.dto.FacultyResponse;
import com.esdproject.facultyupdate.dto.FacultyUpdateRequest;
import com.esdproject.facultyupdate.service.FacultyService;
import com.esdproject.facultyupdate.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/faculty")
@RequiredArgsConstructor
@Tag(name = "Faculty Management", description = "APIs for managing faculty details")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class FacultyController {

    private final FacultyService facultyService;
    private final FileStorageService fileStorageService;

    @PostMapping
    @Operation(summary = "Register a new faculty member")
    public ResponseEntity<ApiResponse<FacultyResponse>> registerFaculty(
            @Valid @RequestBody FacultyRegistrationRequest request) {
        FacultyResponse response = facultyService.registerFaculty(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Faculty registered successfully", response));
    }

    /**
     * Get current logged-in faculty member's profile
     */
    @GetMapping("/me")
    @Operation(summary = "Get current faculty member's profile")
    public ResponseEntity<ApiResponse<FacultyResponse>> getCurrentFacultyProfile() {
        FacultyResponse response = facultyService.getCurrentFacultyProfile();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Update current logged-in faculty member's profile
     */
    @PutMapping("/me")
    @Operation(summary = "Update current faculty member's profile")
    public ResponseEntity<ApiResponse<FacultyResponse>> updateCurrentFacultyProfile(
            @Valid @RequestBody FacultyUpdateRequest request) {
        FacultyResponse response = facultyService.updateCurrentFacultyProfile(request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    /**
     * DEPRECATED: Use /me endpoint instead
     * This endpoint is restricted for security - faculty can only update their own data
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update faculty details (DEPRECATED - use /me)", deprecated = true)
    @Deprecated
    public ResponseEntity<ApiResponse<FacultyResponse>> updateFaculty(
            @PathVariable Integer id,
            @Valid @RequestBody FacultyUpdateRequest request) {
        // This is now deprecated - redirect to use /me endpoint
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("Direct ID-based updates are not allowed. Use /api/faculty/me to update your own profile."));
    }

    /**
     * Upload photo for current logged-in faculty member
     */
    @PostMapping(value = "/me/upload-photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload faculty photograph for current user")
    public ResponseEntity<ApiResponse<String>> uploadPhoto(
            @RequestParam("file") MultipartFile file) {
        try {
            // Get current user's profile first to get the employee ID
            FacultyResponse existing = facultyService.getCurrentFacultyProfile();
            
            // Store file with employee ID as name
            String filePath = fileStorageService.storeFile(file, existing.getEmployeeId());
            
            if (filePath != null) {
                // Update with new photo path
                FacultyUpdateRequest updateRequest = new FacultyUpdateRequest();
                updateRequest.setId(existing.getId());
                updateRequest.setPhotographPath(filePath);
                updateRequest.setFirstName(existing.getFirstName());
                updateRequest.setLastName(existing.getLastName());
                updateRequest.setEmail(existing.getEmail());
                updateRequest.setTitle(existing.getTitle());
                updateRequest.setDepartmentId(existing.getDepartment().getDepartmentId());
                updateRequest.setCourseIds(existing.getCourses().stream()
                        .map(FacultyResponse.CourseDto::getCourseId)
                        .toList());
                
                facultyService.updateFaculty(updateRequest);
                return ResponseEntity.ok(ApiResponse.success("Photo uploaded successfully", filePath));
            }
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to upload photo"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error uploading photo: " + e.getMessage()));
        }
    }

    /**
     * DEPRECATED: Use /me endpoint instead
     * This endpoint is restricted for security
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get faculty by ID (DEPRECATED - use /me)", deprecated = true)
    @Deprecated
    public ResponseEntity<ApiResponse<FacultyResponse>> getFacultyById(@PathVariable Integer id) {
        // Restricted - users should only access their own profile via /me
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("Direct ID-based access is not allowed. Use /api/faculty/me to get your own profile."));
    }

    /**
     * DEPRECATED: Removed for security - faculty should not see all faculty data
     * Each faculty member can only see their own profile
     */
    @GetMapping
    @Operation(summary = "Get all faculty members (DEPRECATED - FORBIDDEN)", deprecated = true)
    @Deprecated
    public ResponseEntity<ApiResponse<Object>> getAllFaculty() {
        // Removed for security reasons
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("Listing all faculty is not allowed. Use /api/faculty/me to get your own profile."));
    }

    /**
     * DEPRECATED: Faculty members cannot delete their own accounts
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete faculty member (DEPRECATED - FORBIDDEN)", deprecated = true)
    @Deprecated
    public ResponseEntity<ApiResponse<Object>> deleteFaculty(@PathVariable Integer id) {
        // Removed - faculty should not be able to delete accounts
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("Faculty members cannot delete accounts. Please contact administrator."));
    }
}

