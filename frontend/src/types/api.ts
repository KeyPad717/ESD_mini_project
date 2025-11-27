export interface Department {
  departmentId: number
  name: string
  capacity?: number | null
}

export interface Course {
  courseId: number
  courseCode: string
  name: string
  description?: string | null
  year?: number | null
  term?: string | null
  faculty?: string | null
  credits?: number | null
  capacity?: number | null
}

export interface Faculty {
  id: number
  employeeId: string
  firstName: string
  lastName: string
  email: string
  title?: string | null
  photographPath?: string | null
  department?: Department | null
  courses?: Course[] | null
}

export interface FacultyFormPayload {
  id?: number
  firstName: string
  lastName: string
  email: string
  title?: string | null
  departmentId: number
  courseIds: number[]
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}
