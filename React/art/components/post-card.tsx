"use client"

import * as React from "react"
import type { Post } from "@/lib/api"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatPostDate, getPostInitials } from "@/lib/post-utils"
import { cn } from "@/lib/utils"

type Props = {
  post: Post
  onClick?: (post: Post) => void
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

export function PostCard({ post, onClick, index = 0 }: Props) {
  const [imgError, setImgError] = React.useState(false)
  const accent = accentRotation[index % accentRotation.length]
  const authorBg = authorBgRotation[index % authorBgRotation.length]
  const authorName = post.user?.name || post.user?.email || "Anônimo"

  return (
    <button
      type="button"
      onClick={() => onClick?.(post)}
      className="group block w-full rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={`Abrir detalhes da arte ${post.title}`}
    >
      <article
        className={cn(
          "flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground",
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
            <div>
              <span className="inline-flex rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                {post.category || "Sem categoria"}
              </span>
              <h3 className="mt-2 font-display text-lg font-bold leading-tight text-balance">
                {post.title}
              </h3>
            </div>
          </div>

          {post.description ? (
            <p className="line-clamp-3 text-sm text-muted-foreground text-pretty">
              {post.description}
            </p>
          ) : null}

          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            <div className="flex min-w-0 items-center gap-2">
              <Avatar className="h-8 w-8 shrink-0">
                {post.user?.avatarUrl ? (
                  <AvatarImage
                    src={post.user.avatarUrl}
                    alt={`Foto de perfil de ${authorName}`}
                  />
                ) : null}
                <AvatarFallback
                  className={cn(
                    "text-xs font-bold",
                    authorBg,
                  )}
                >
                  {getPostInitials(post.user?.name, post.user?.email)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-sm font-medium">
                {authorName}
              </span>
            </div>
            {post.createdAt ? (
              <time
                dateTime={post.createdAt}
                className="shrink-0 text-xs text-muted-foreground"
              >
                {formatPostDate(post.createdAt)}
              </time>
            ) : null}
          </div>
        </div>
      </article>
    </button>
  )
}
