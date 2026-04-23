export type UserRole = 'admin' | 'guru' | 'siswa';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
}

export interface Student {
  id: string;
  user_id: string;
  nis: string;
  name: string;
  class: string;
}

export interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'a' | 'b' | 'c' | 'd';
  created_by: string;
  created_at: string;
}

export interface Exam {
  id: string;
  title: string;
  duration: number; // in minutes
  created_by: string;
  created_at: string;
  questions?: Question[];
}

export interface ExamQuestion {
  id: string;
  exam_id: string;
  question_id: string;
}

export interface Answer {
  id: string;
  user_id: string;
  exam_id: string;
  question_id: string;
  answer: string;
}

export interface Result {
  id: string;
  user_id: string;
  exam_id: string;
  score: number;
  created_at: string;
  exam_title?: string;
  student_name?: string;
}
