-- Drop old uppercase tables if they exist
DROP TABLE IF EXISTS Faculty_Courses;
DROP TABLE IF EXISTS Employees;
DROP TABLE IF EXISTS Courses;
DROP TABLE IF EXISTS Departments;

-- Drop lowercase tables to recreate with new schema
DROP TABLE IF EXISTS faculty_courses;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS departments;

-- Create departments table
CREATE TABLE departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    capacity INT
);

-- Create courses table
CREATE TABLE courses (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    course_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    year INT,
    term VARCHAR(20),
    faculty VARCHAR(50),
    credits INT,
    capacity INT
);

-- Create employees table with surrogate key
CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(50),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(50),
    photograph_path VARCHAR(255),
    department INT,
    FOREIGN KEY (department) REFERENCES departments(department_id)
);

-- Create faculty_courses junction table
CREATE TABLE faculty_courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    faculty INT NOT NULL,
    course_id INT NOT NULL,
    FOREIGN KEY (faculty) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    UNIQUE KEY unique_faculty_course (faculty, course_id)
);

-- Insert 1 department for testing
INSERT INTO departments (name, capacity) VALUES
('Computer Science', 100);

-- Insert 3 courses for testing
INSERT INTO courses (course_code, name, description, year, term, faculty, credits, capacity) VALUES
('CS101', 'Introduction to Programming', 'Basic programming concepts using Python and Java', 1, 'Fall', NULL, 4, 50),
('CS201', 'Data Structures and Algorithms', 'Advanced data structures and algorithmic techniques', 2, 'Spring', NULL, 4, 40),
('CS301', 'Database Management Systems', 'Database design, SQL, and transaction management', 3, 'Fall', NULL, 3, 35);

-- Insert TEST faculty member: John Derry
-- IMPORTANT: This is the ONLY user who can login successfully
INSERT INTO employees (employee_id, first_name, last_name, email, title, photograph_path, department) VALUES
('FAC-CS-001', 'John', 'Derry', 'faculty19019@gmail.com', 'Associate Professor', 'uploads/faculty-photos/FAC-CS-001.png', 1);

-- Insert faculty-course associations for John Derry
INSERT INTO faculty_courses (faculty, course_id) VALUES
(1, 1),  -- John Derry teaches CS101
(1, 2),  -- John Derry teaches CS201
(1, 3);  -- John Derry teaches CS301
