// Client HTTP para o backend Spring Boot (Nunki)
// Configure NEXT_PUBLIC_API_URL nas variáveis de ambiente para produção.

const DEFAULT_API_URL = "http://localhost:8080"

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.trim() || DEFAULT_API_URL

export function getApiLabel() {
  return API_URL.replace(/\/$/, "")
}

export type User = {
  id: number
  name: string
  email: string
  avatarUrl?: string | null
}

export type Post = {
  id: number
  title: string
  description: string
  imageUrl: string
  category: string
  user?: User | null
  createdAt: string
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${getApiLabel()}${path.startsWith("/") ? path : `/${path}`}`
  const headers = new Headers(options.headers)

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  let res: Response

  try {
    res = await fetch(url, {
      ...options,
      headers,
      cache: "no-store",
      credentials: "include",
    })
  } catch {
    throw new Error(
      `Nao conseguimos conectar com a API em ${getApiLabel()}. Confirme se o backend Spring esta rodando e se NEXT_PUBLIC_API_URL esta correto.`,
    )
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(
      text ||
        `Erro ${res.status} ao chamar ${path}. Verifique se a API aceita essa operacao.`,
    )
  }

  // alguns endpoints (DELETE) retornam 204 sem body
  if (res.status === 204) return undefined as T

  const contentType = res.headers.get("content-type") ?? ""
  if (!contentType.includes("application/json")) {
    return (await res.text()) as unknown as T
  }

  return (await res.json()) as T
}

// ---------------- Auth ----------------

export function register(input: {
  name: string
  email: string
  avatarUrl?: string
  password: string
}) {
  return request<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function login(input: { email: string; password: string }) {
  return request<User>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function getCurrentUser() {
  return request<User>("/auth/me", { method: "GET" })
}

export function logout() {
  return request<void>("/auth/logout", { method: "POST" })
}

// ---------------- Posts ----------------

export function listPosts() {
  return request<Post[]>("/posts", { method: "GET" })
}

export function getPost(id: number) {
  return request<Post>(`/posts/${id}`, { method: "GET" })
}

export function createPost(input: {
  title: string
  description: string
  imageUrl: string
  category: string
}) {
  return request<Post>("/posts", {
    method: "POST",
    body: JSON.stringify({
      title: input.title,
      description: input.description,
      imageUrl: input.imageUrl,
      category: input.category,
    }),
  })
}

export function updatePost(
  id: number,
  input: {
    title: string
    description: string
    imageUrl: string
    category: string
  },
) {
  return request<Post>(`/posts/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      title: input.title,
      description: input.description,
      imageUrl: input.imageUrl,
      category: input.category,
    }),
  })
}

export function deletePost(id: number) {
  return request<void>(`/posts/${id}`, {
    method: "DELETE",
  })
}

// ---------------- Users ----------------

export function getUser(id: number) {
  return request<User>(`/users/${id}`, { method: "GET" })
}

export function updateUser(
  id: number,
  input: { name: string; email: string; avatarUrl?: string; password?: string },
) {
  return request<User>(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  })
}

export function deleteUser(id: number) {
  return request<void>(`/users/${id}`, { method: "DELETE" })
}
