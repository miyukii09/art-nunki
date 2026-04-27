// Client HTTP para o backend Spring Boot (Nunki)
// Configure NEXT_PUBLIC_API_URL nas variáveis de ambiente para produção.

const DEFAULT_API_URL =
  process.env.NODE_ENV === "production"
    ? "https://nunki-api-dcp4.onrender.com"
    : "http://localhost:8080"

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

export type PasswordResetResponse = {
  message: string
  resetUrl?: string | null
}

export type AuthSession = {
  user: User
  token: string
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback
}

function asOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

export function normalizeUser(value: unknown): User | null {
  if (!isRecord(value)) {
    return null
  }

  const id = asNumber(value.id)
  const email = asString(value.email)

  if (!id || !email) {
    return null
  }

  return {
    id,
    name: asString(value.name),
    email,
    avatarUrl: asOptionalString(value.avatarUrl),
  }
}

function normalizePost(value: unknown): Post | null {
  if (!isRecord(value)) {
    return null
  }

  const id = asNumber(value.id)
  const title = asString(value.title)
  const imageUrl = asString(value.imageUrl)

  if (!id || !title || !imageUrl) {
    return null
  }

  return {
    id,
    title,
    description: asString(value.description),
    imageUrl,
    category: asString(value.category),
    user: normalizeUser(value.user),
    createdAt: asString(value.createdAt),
  }
}

function normalizeSession(value: unknown): AuthSession {
  if (!isRecord(value)) {
    throw new Error("Resposta de login invalida recebida da API.")
  }

  const user = normalizeUser(value.user)
  const token = asString(value.token)

  if (!user || !token) {
    throw new Error("Resposta de login invalida recebida da API.")
  }

  return { user, token }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${getApiLabel()}${path.startsWith("/") ? path : `/${path}`}`
  const headers = new Headers(options.headers)
  const authToken = getStoredAuthToken()

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  if (authToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${authToken}`)
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
  return request<unknown>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  }).then((value) => {
    const user = normalizeUser(value)
    if (!user) {
      throw new Error("Resposta de cadastro invalida recebida da API.")
    }
    return user
  })
}

export function login(input: { email: string; password: string }) {
  return request<unknown>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  }).then(normalizeSession)
}

export function getCurrentUser() {
  return request<unknown>("/auth/me", { method: "GET" }).then((value) => {
    const user = normalizeUser(value)
    if (!user) {
      throw new Error("Resposta invalida ao carregar a sessao atual.")
    }
    return user
  })
}

export function logout() {
  return request<void>("/auth/logout", { method: "POST" })
}

export function requestPasswordReset(input: {
  email: string
  appBaseUrl: string
}) {
  return request<PasswordResetResponse>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function resetPassword(input: { token: string; password: string }) {
  return request<string>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

// ---------------- Posts ----------------

export function listPosts() {
  return request<unknown>("/posts", { method: "GET" }).then((value) => {
    if (!Array.isArray(value)) {
      throw new Error("Resposta invalida ao carregar as artes.")
    }

    return value
      .map(normalizePost)
      .filter((post): post is Post => post !== null)
  })
}

export function getPost(id: number) {
  return request<unknown>(`/posts/${id}`, { method: "GET" }).then((value) => {
    const post = normalizePost(value)
    if (!post) {
      throw new Error("Resposta invalida ao carregar a arte.")
    }
    return post
  })
}

export function createPost(input: {
  title: string
  description: string
  imageUrl: string
  category: string
}) {
  return request<unknown>("/posts", {
    method: "POST",
    body: JSON.stringify({
      title: input.title,
      description: input.description,
      imageUrl: input.imageUrl,
      category: input.category,
    }),
  }).then((value) => {
    const post = normalizePost(value)
    if (!post) {
      throw new Error("Resposta invalida ao criar a arte.")
    }
    return post
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
  return request<unknown>(`/posts/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      title: input.title,
      description: input.description,
      imageUrl: input.imageUrl,
      category: input.category,
    }),
  }).then((value) => {
    const post = normalizePost(value)
    if (!post) {
      throw new Error("Resposta invalida ao atualizar a arte.")
    }
    return post
  })
}

export function deletePost(id: number) {
  return request<void>(`/posts/${id}`, {
    method: "DELETE",
  })
}

// ---------------- Users ----------------

export function getUser(id: number) {
  return request<unknown>(`/users/${id}`, { method: "GET" }).then((value) => {
    const user = normalizeUser(value)
    if (!user) {
      throw new Error("Resposta invalida ao carregar o usuario.")
    }
    return user
  })
}

export function updateUser(
  id: number,
  input: { name: string; email: string; avatarUrl?: string; password?: string },
) {
  return request<unknown>(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  }).then((value) => {
    const user = normalizeUser(value)
    if (!user) {
      throw new Error("Resposta invalida ao atualizar o usuario.")
    }
    return user
  })
}

export function deleteUser(id: number) {
  return request<void>(`/users/${id}`, { method: "DELETE" })
}

const TOKEN_STORAGE_KEY = "nunki.token"

export function getStoredAuthToken() {
  if (typeof window === "undefined") {
    return null
  }

  const value = window.localStorage.getItem(TOKEN_STORAGE_KEY)
  return value && value.trim() ? value : null
}

export function setStoredAuthToken(token: string | null) {
  if (typeof window === "undefined") {
    return
  }

  if (token && token.trim()) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
    return
  }

  window.localStorage.removeItem(TOKEN_STORAGE_KEY)
}
