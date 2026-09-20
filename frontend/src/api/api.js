const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('accessToken')

  const isFormData = options.body instanceof FormData

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,

    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),

      ...(token && {
        Authorization: `Bearer ${token}`,
      }),

      ...options.headers,
    },

    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong")
  }

  return data
}