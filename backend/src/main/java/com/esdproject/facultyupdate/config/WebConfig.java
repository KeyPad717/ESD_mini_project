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
        // Serve files from the project root's uploads directory
        // We need to go up one level from backend/ to reach the project root
        // Or better, use the absolute path we know: /home/iiitb/IdeaProjects/working_project/uploads/
        
        String projectRootUploads = "/home/iiitb/IdeaProjects/working_project/uploads/";
        
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + projectRootUploads);
    }
}
