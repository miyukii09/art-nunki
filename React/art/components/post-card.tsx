"use client"

import * as React from "react"
import type { Post } from "@/lib/api"
import { cn } from "@/lib/utils"

type Props = {
  post: Post
  /** índice no grid, usado para alternar cores de borda/sotaque */
  index?: number
}

const accentRotation = [
  "ring-brand-magenta",
  "ring-brand-yellow",
  "ring-brand-teal",
] as const

const authorBgRotation = [
  "bg-primary text-primary-foreground",
  "bg-accent text-accent-foreground",
  "bg-secondary text-secondary-foreground",
] as const

function initials(name?: string | null, email?: string | null) {
  const source = (name || email || "?").trim()
  return source
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d)
  } catch {
    return ""
  }
}

export function PostCard({ post, index = 0 }: Props) {
  const [imgError, setImgError] = React.useState(false)
  const accent = accentRotation[index % accentRotation.length]
  const authorBg = authorBgRotation[index % authorBgRotation.length]

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground",
        "shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        "hover:ring-2 hover:ring-offset-2 hover:ring-offset-background",
        "animate-fade-in-up",
        accent,
      )}
      style={{ animationDelay: `${Math.min(index, 11) * 60}ms` }}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
        {post.imageUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.imageUrl || "/placeholder.svg"}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
            crossOrigin="anonymous"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
            <span className="text-sm">Imagem indisponível</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-bold leading-tight text-balance">
            {post.title}
          </h3>
        </div>

        {post.description ? (
          <p className="line-clamp-3 text-sm text-muted-foreground text-pretty">
            {post.description}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold",
                authorBg,
              )}
              aria-hidden="true"
            >
              {initials(post.user?.name, post.user?.email)}
            </span>
            <span className="truncate text-sm font-medium">
              {post.user?.name ?? "Anônimo"}
            </span>
          </div>
          {post.createdAt ? (
            <time
              dateTime={post.createdAt}
              className="shrink-0 text-xs text-muted-foreground"
            >
              {formatDate(post.createdAt)}
            </time>
          ) : null}
        </div>
      </div>
    </article>
  )
}
