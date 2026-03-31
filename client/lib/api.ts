export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export interface AuthPayload {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "CLIENT" | "FREELANCER";
    skills: string[];
    rating: number;
    trustScore: number;
    experience: string;
    portfolio: string[];
  };
}

export async function registerRequest(payload: {
  name: string;
  email: string;
  password: string;
  role: "CLIENT" | "FREELANCER";
  skills: string[];
  experience: string;
  portfolio: string[];
}) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Registration failed");
  }

  return (await response.json()) as AuthPayload;
}

export async function loginRequest(payload: { email: string; password: string }) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Login failed");
  }

  return (await response.json()) as AuthPayload;
}

export async function meRequest(token: string) {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Failed to load profile");
  }

  return response.json();
}
