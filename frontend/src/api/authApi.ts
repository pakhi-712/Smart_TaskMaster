import axios from "axios";
import type { RegisterRequest, LoginRequest, AuthResponse } from "../types/task";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await axios.post<AuthResponse>(
    `${API_BASE}/api/auth/register`,
    data
  );
  return response.data;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await axios.post<AuthResponse>(
    `${API_BASE}/api/auth/login`,
    data
  );
  return response.data;
}

// Step 1: send email, get back the security question
export async function forgotPassword(email: string): Promise<string> {
  const response = await axios.post<{ securityQuestion: string }>(
    `${API_BASE}/api/auth/forgot-password`,
    { email }
  );
  return response.data.securityQuestion;
}

// Step 2: answer security question + set new password
export async function resetPassword(
  email: string,
  securityAnswer: string,
  newPassword: string
): Promise<string> {
  const response = await axios.post<{ message: string }>(
    `${API_BASE}/api/auth/reset-password`,
    { email, securityAnswer, newPassword }
  );
  return response.data.message;
}

export function saveToken(token: string): void {
  localStorage.setItem("token", token);
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function saveUser(name: string, email: string): void {
  localStorage.setItem("userName", name);
  localStorage.setItem("userEmail", email);
}

export function getUser(): { name: string; email: string } | null {
  const name = localStorage.getItem("userName");
  const email = localStorage.getItem("userEmail");
  if (name && email) {
    return { name, email };
  }
  return null;
}

export function logout(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
}

export function isLoggedIn(): boolean {
  return getToken() !== null;
}