export function getPostInitials(name?: string | null, email?: string | null) {
  const source = (name || email || "?").trim()
  return source
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function formatPostDate(iso: string) {
  try {
    const date = new Date(iso)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date)
  } catch {
    return ""
  }
}
