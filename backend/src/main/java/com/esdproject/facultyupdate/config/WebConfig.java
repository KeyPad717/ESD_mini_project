package com.esdproject.facultyupdate.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Convert relative path to absolute path
        String absoluteUploadDir = System.getProperty("user.dir") + "/" + uploadDir;
        
        // Map /uploads/** URLs to the upload directory root
        // So /uploads/faculty-photos/file.jpg will serve from {projectRoot}/uploads/faculty-photos/file.jpg
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + System.getProperty("user.dir") + "/uploads/");
    }
}
