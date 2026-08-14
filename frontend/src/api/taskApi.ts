import axios from "axios";
import type { Task, TaskCreateRequest } from "../types/task";
import { getToken } from "./authApi";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

function authAxios() {
  const token = getToken();
  return axios.create({
    baseURL: API_BASE,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
}

export async function getStats(): Promise<{
  total: number;
  pending: number;
  completed: number;
  highPriority: number;
  overdue: number;
}> {
  const response = await authAxios().get("/api/tasks/stats");
  return response.data;
}

// ---- Task CRUD ----

export async function getAllTasks(
  status?: string,
  priority?: string,
  keyword?: string
): Promise<Task[]> {
  const params: Record<string, string> = {};
  if (status) params.status = status;
  if (priority) params.priority = priority;
  if (keyword) params.keyword = keyword;

  const response = await authAxios().get<Task[]>("/api/tasks", { params });
  return response.data;
}

export async function getTaskById(id: number): Promise<Task> {
  const response = await authAxios().get<Task>(`/api/tasks/${id}`);
  return response.data;
}

export async function createTask(task: TaskCreateRequest): Promise<Task> {
  const response = await authAxios().post<Task>("/api/tasks", task);
  return response.data;
}

export async function updateTask(id: number, task: TaskCreateRequest): Promise<Task> {
  const response = await authAxios().put<Task>(`/api/tasks/${id}`, task);
  return response.data;
}

export async function toggleTaskStatus(id: number): Promise<Task> {
  const response = await authAxios().patch<Task>(`/api/tasks/${id}/status`);
  return response.data;
}

export async function deleteTask(id: number): Promise<void> {
  await authAxios().delete(`/api/tasks/${id}`);
}

export async function addSubtask(taskId: number, text: string): Promise<Task> {
  const response = await authAxios().post<Task>(
    `/api/tasks/${taskId}/subtasks`,
    { text }
  );
  return response.data;
}

export async function toggleSubtask(taskId: number, subtaskId: number): Promise<Task> {
  const response = await authAxios().patch<Task>(
    `/api/tasks/${taskId}/subtasks/${subtaskId}`
  );
  return response.data;
}

export async function deleteSubtask(taskId: number, subtaskId: number): Promise<Task> {
  const response = await authAxios().delete<Task>(
    `/api/tasks/${taskId}/subtasks/${subtaskId}`
  );
  return response.data;
}
