export interface Subtask {
  id: number;
  text: string;
  completed: boolean;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: "PENDING" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  category: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  subtasks: Subtask[];
}

export interface TaskCreateRequest {
  title: string;
  description?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  category?: string;
  dueDate?: string;
  subtasks?: string[];
}

export interface DashboardStats {
  total: number;
  pending: number;
  completed: number;
  highPriority: number;
  overdue: number;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  securityQuestion: string;
  securityAnswer: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  name: string;
  email: string;
}