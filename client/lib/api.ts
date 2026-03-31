export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

const NETWORK_ERROR_MESSAGE =
  "Cannot reach API server. Start backend on port 4000 and set NEXT_PUBLIC_API_URL in client/.env.local.";

async function parseErrorMessage(response: Response, fallback: string) {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const payload = (await response.json()) as { message?: string };
    return payload.message ?? fallback;
  }
  const text = await response.text();
  return text || fallback;
}

async function safeFetch(input: RequestInfo | URL, init?: RequestInit) {
  try {
    return await fetch(input, init);
  } catch {
    throw new Error(NETWORK_ERROR_MESSAGE);
  }
}

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
  const response = await safeFetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Registration failed"));
  }

  return (await response.json()) as AuthPayload;
}

export async function loginRequest(payload: { email: string; password: string }) {
  const response = await safeFetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Login failed"));
  }

  return (await response.json()) as AuthPayload;
}

export async function meRequest(token: string) {
  const response = await safeFetch(`${API_BASE_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Failed to load profile"));
  }

  return response.json();
}

export async function listFreelancersRequest(params: { skills?: string; rating?: number }) {
  const query = new URLSearchParams();
  if (params.skills) {
    query.set("skills", params.skills);
  }
  if (typeof params.rating === "number" && !Number.isNaN(params.rating)) {
    query.set("rating", String(params.rating));
  }

  const suffix = query.toString() ? `?${query.toString()}` : "";
  const response = await safeFetch(`${API_BASE_URL}/freelancers${suffix}`);
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Failed to load freelancers"));
  }
  return response.json();
}

export async function createProjectRequest(
  token: string,
  payload: { title: string; description: string; workType: "STRUCTURED" | "CREATIVE" },
) {
  const response = await safeFetch(`${API_BASE_URL}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Failed to create project"));
  }

  return response.json();
}

export async function listProjectsRequest(token: string) {
  const response = await safeFetch(`${API_BASE_URL}/projects`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Failed to load projects"));
  }

  return response.json();
}

export async function getProjectRequest(token: string, projectId: string) {
  const response = await safeFetch(`${API_BASE_URL}/projects/${projectId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Failed to load project"));
  }

  return response.json();
}

export async function assignFreelancerRequest(
  token: string,
  projectId: string,
  freelancerId: string,
) {
  const response = await safeFetch(`${API_BASE_URL}/projects/${projectId}/assign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ freelancerId }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Failed to assign freelancer"));
  }

  return response.json();
}
