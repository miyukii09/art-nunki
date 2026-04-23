"use client"

import * as React from "react"
import Link from "next/link"
import { Loader2, AlertCircle, Sparkles } from "lucide-react"
import { getApiLabel, listPosts, type Post } from "@/lib/api"
import { PostCard } from "@/components/post-card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ok"; posts: Post[] }

export function Gallery() {
  const [state, setState] = React.useState<State>({ status: "loading" })
  const { user } = useAuth()

  const load = React.useCallback(async () => {
    setState({ status: "loading" })
    try {
      const posts = await listPosts()
      setState({ status: "ok", posts })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro inesperado ao carregar."
      setState({ status: "error", message })
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2
          className="h-8 w-8 animate-spin text-primary"
          aria-hidden="true"
        />
        <span className="sr-only">Carregando artes...</span>
      </div>
    )
  }

  if (state.status === "error") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center">
        <AlertCircle
          className="h-10 w-10 text-destructive"
          aria-hidden="true"
        />
        <div>
          <h2 className="font-display text-lg font-bold">
            Não foi possível carregar as artes
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{state.message}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Verifique se o backend está rodando em{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono">
              {getApiLabel()}
            </code>
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={load} className="rounded-full">
            Tentar novamente
          </Button>
          <Button asChild variant="outline" className="rounded-full border-2">
            <Link href={user ? "/publicar" : "/register"}>
              {user ? "Publicar uma arte" : "Criar conta"}
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  if (state.posts.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-xl border-2 border-dashed border-border bg-card p-10 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-accent text-accent-foreground">
          <Sparkles className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold">
            Nenhuma arte por aqui ainda
          </h2>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            Seja o primeiro a publicar e iluminar a galeria Nunki.
          </p>
        </div>
        {user ? (
          <Button asChild className="rounded-full">
            <Link href="/publicar">Publicar minha primeira arte</Link>
          </Button>
        ) : (
          <Button asChild className="rounded-full">
            <Link href="/register">Criar conta para publicar</Link>
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {state.posts.map((post, i) => (
        <PostCard key={post.id} post={post} index={i} />
      ))}
    </div>
  )
}
