const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function getProfile() {
  const res = await fetch(`${API_URL}/api/v1/profile`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

export async function getExperiences() {
  const res = await fetch(`${API_URL}/api/v1/experiences`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch experiences");
  return res.json();
}

export async function getProjects() {
  const res = await fetch(`${API_URL}/api/v1/projects`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

export async function getTechnologies() {
  const res = await fetch(`${API_URL}/api/v1/technologies`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch technologies");
  return res.json();
}

export async function submitContactForm(name: string, email: string, message: string) {
  const res = await fetch(`${API_URL}/api/v1/contact/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name, email, message }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Failed to submit contact message");
  }
  return res.json();
}

function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
  };
}

export async function adminLogin(data: any) {
  const res = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Incorrect email or password");
  }
  return res.json();
}

export async function getUsersCMS() {
  const res = await fetch(`${API_URL}/api/v1/users`, {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: "include",
  });
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Unauthorized access (401). Please log in again.");
    }
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to fetch users");
  }
  return res.json();
}

export async function createUserCMS(data: any) {
  const res = await fetch(`${API_URL}/api/v1/users`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to create user");
  }
  return res.json();
}

export async function updateUserStatusCMS(id: number, isActive: boolean) {
  const res = await fetch(`${API_URL}/api/v1/users/${id}/status`, {
    method: "PUT",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify({ is_active: isActive }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to update user status");
  }
  return res.json();
}

export async function forgotPassword(email: string) {
  const res = await fetch(`${API_URL}/api/v1/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "Request failed");
  }
  return res.json();
}

export async function verifyOTP(email: string, otp: string) {
  const res = await fetch(`${API_URL}/api/v1/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, otp }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "OTP verification failed");
  }
  return res.json();
}

export async function resetPassword(data: any) {
  const res = await fetch(`${API_URL}/api/v1/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "Password reset failed");
  }
  return res.json();
}

export async function updateProfileCMS(data: any) {
  const res = await fetch(`${API_URL}/api/v1/profile`, {
    method: "PUT",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
}

export async function createExperienceCMS(data: any) {
  const res = await fetch(`${API_URL}/api/v1/experiences`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create experience");
  return res.json();
}

export async function updateExperienceCMS(id: number, data: any) {
  const res = await fetch(`${API_URL}/api/v1/experiences/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update experience");
  return res.json();
}

export async function deleteExperienceCMS(id: number) {
  const res = await fetch(`${API_URL}/api/v1/experiences/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete experience");
  return true;
}

export async function createProjectCMS(data: any) {
  const res = await fetch(`${API_URL}/api/v1/projects`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create project");
  return res.json();
}

export async function updateProjectCMS(id: number, data: any) {
  const res = await fetch(`${API_URL}/api/v1/projects/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update project");
  return res.json();
}

export async function deleteProjectCMS(id: number) {
  const res = await fetch(`${API_URL}/api/v1/projects/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete project");
  return true;
}

export async function createTechnologyCMS(data: any) {
  const res = await fetch(`${API_URL}/api/v1/technologies`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create technology");
  return res.json();
}

export async function updateTechnologyCMS(id: number, data: any) {
  const res = await fetch(`${API_URL}/api/v1/technologies/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update technology");
  return res.json();
}

export async function deleteTechnologyCMS(id: number) {
  const res = await fetch(`${API_URL}/api/v1/technologies/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete technology");
  return true;
}

export async function updateUserCMS(id: number, data: any) {
  const res = await fetch(`${API_URL}/api/v1/users/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to update user");
  }
  return res.json();
}

export async function deleteUserCMS(id: number) {
  const res = await fetch(`${API_URL}/api/v1/users/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    credentials: "include",
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to delete user");
  }
  return true;
}

export async function adminLogout() {
  const res = await fetch(`${API_URL}/api/v1/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to logout");
  return res.json();
}
