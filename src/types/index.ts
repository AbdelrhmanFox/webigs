export interface User {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
  }
  
  export interface Student {
    id: string;
    name: string;
    email: string;
    mobile: string;
    cohort: string;
    campus: string;
    school: string;
    major: string;
  }
  
  export interface Course {
    id: string;
    name: string;
    code: string;
    instructor: string;
    schedule: string;
    description?: string;
  }
  
  export interface AttendanceRecord {
    date: string;
    present: boolean;
  }
  
  export interface Enrollment {
    courseId: string;
    studentId: string;
  }