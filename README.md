# Faculty Update System

A full-stack application for managing faculty details in an Academic ERP system. This module allows administrators and employees to modify faculty information including employee ID, photograph, and course assignments.

## Features

- **Faculty Management**: Create, read, update, and delete faculty members
- **Employee ID Modification**: Update employee IDs and all related information
- **Photograph Management**: Upload and manage faculty photographs (stored as file paths, not blobs)
- **Course Assignment**: Assign multiple courses to faculty members via dropdown selection
- **Google OAuth Authentication**: Secure login using Google OAuth2
- **RESTful API**: Complete REST API with Swagger documentation
- **React Frontend**: Modern, responsive UI built with React

## Tech Stack

### Backend
- Spring Boot 3.2.0
- Spring Data JPA
- Spring Security with OAuth2
- MySQL Database
- Lombok
- Swagger/OpenAPI

### Frontend
- React 18
- React Router
- Axios
- Vite

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- Node.js 18+ and npm
- MySQL 8.0+
- Google OAuth2 credentials

## Setup Instructions

### 1. Database Setup

```sql
CREATE DATABASE faculty_update;

USE faculty_update;

-- Tables will be created automatically by JPA
-- Sample data will be loaded from data.sql
```

### 2. Google OAuth2 Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:8080/login/oauth2/code/google`
6. Copy Client ID and Client Secret

### 3. Backend Configuration

1. Update `src/main/resources/application.properties`:
   - Set your MySQL username and password
   - Add your Google OAuth2 Client ID and Client Secret:
     ```properties
     spring.security.oauth2.client.registration.google.client-id=YOUR_CLIENT_ID
     spring.security.oauth2.client.registration.google.client-secret=YOUR_CLIENT_SECRET
     ```

2. Build and run the Spring Boot application:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

   The backend will be available at `http://localhost:8080`

3. Access Swagger UI at: `http://localhost:8080/swagger-ui.html`

### 4. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `GET /api/auth/user` - Get current authenticated user
- `GET /api/auth/success` - OAuth login success callback
- `POST /api/auth/logout` - Logout

### Faculty Management
- `GET /api/faculty` - Get all faculty members
- `GET /api/faculty/{id}` - Get faculty by ID
- `POST /api/faculty` - Create new faculty member
- `PUT /api/faculty/{id}` - Update faculty member
- `DELETE /api/faculty/{id}` - Delete faculty member
- `POST /api/faculty/{id}/upload-photo` - Upload faculty photograph

### Reference Data
- `GET /api/departments` - Get all departments
- `GET /api/courses` - Get all courses

## Usage

1. **Login**: Navigate to `http://localhost:3000/login` and sign in with Google
2. **View Faculty**: After login, you'll see the list of all faculty members
3. **Add Faculty**: Click "Add New Faculty" to create a new faculty member
4. **Edit Faculty**: Click "Edit" on any faculty member to modify their details
5. **Upload Photo**: Select a photo file when creating or editing faculty
6. **Assign Courses**: Select courses from the dropdown when creating/editing faculty

## Project Structure

```
faculty-update/
├── src/
│   ├── main/
│   │   ├── java/com/esdproject/facultyupdate/
│   │   │   ├── config/          # Security and Swagger configuration
│   │   │   ├── controller/      # REST controllers
│   │   │   ├── dto/             # Data Transfer Objects
│   │   │   ├── entity/          # JPA entities
│   │   │   ├── exception/       # Exception handlers
│   │   │   ├── repository/      # JPA repositories
│   │   │   └── service/         # Business logic
│   │   └── resources/
│   │       ├── application.properties
│   │       └── data.sql         # Sample data
│   └── test/
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── context/             # React context (Auth)
│   │   ├── services/            # API service layer
│   │   └── App.jsx
│   └── package.json
└── pom.xml
```

## Database Schema

The application uses the following main tables:
- `Departments` - Department information
- `Employees` - Faculty/Employee information
- `Courses` - Course information
- `Faculty_Courses` - Junction table for faculty-course assignments

## Notes

- Photographs are stored as file paths, not as BLOBs in the database
- All faculty modifications update related tables automatically
- The system validates email uniqueness
- Course assignments are managed through the junction table

## Troubleshooting

1. **OAuth Login Issues**: Ensure redirect URI matches exactly in Google Cloud Console
2. **Database Connection**: Verify MySQL is running and credentials are correct
3. **CORS Issues**: Check that frontend URL matches `app.cors.allowed-origins` in application.properties
4. **File Upload**: Ensure `uploads/faculty-photos` directory exists and has write permissions

## License

This project is part of an ESD (Enterprise Software Development) course assignment.

