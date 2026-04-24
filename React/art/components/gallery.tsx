"use client"

import * as React from "react"
import Link from "next/link"
import { Loader2, AlertCircle, Search, Sparkles, X } from "lucide-react"
import { getApiLabel, listPosts, type Post } from "@/lib/api"
import { PostCard } from "@/components/post-card"
import { PostPreviewDialog } from "@/components/post-preview-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ok"; posts: Post[] }

function normalizeForSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
}

export function Gallery() {
  const [state, setState] = React.useState<State>({ status: "loading" })
  const [selectedPost, setSelectedPost] = React.useState<Post | null>(null)
  const [searchTerm, setSearchTerm] = React.useState("")
  const { user } = useAuth()
  const deferredSearchTerm = React.useDeferredValue(searchTerm)

  function handleUpdatedPost(updatedPost: Post) {
    setState((current) =>
      current.status !== "ok"
        ? current
        : {
            status: "ok",
            posts: current.posts.map((post) =>
              post.id === updatedPost.id ? updatedPost : post,
            ),
          },
    )
    setSelectedPost(updatedPost)
  }

  function handleDeletedPost(postId: number) {
    setState((current) =>
      current.status !== "ok"
        ? current
        : {
            status: "ok",
            posts: current.posts.filter((post) => post.id !== postId),
          },
    )
    setSelectedPost((current) => (current?.id === postId ? null : current))
  }

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

  const normalizedSearch = normalizeForSearch(deferredSearchTerm)

  const filteredPosts = React.useMemo(() => {
    if (state.status !== "ok") return []

    if (!normalizedSearch) return state.posts

    return state.posts.filter((post) => {
      const haystack = [
        post.title,
        post.description,
        post.category,
        post.user?.name,
        post.user?.email,
      ]
        .filter(Boolean)
        .join(" ")
      const normalizedHaystack = normalizeForSearch(haystack)

      return normalizedHaystack.includes(normalizedSearch)
    })
  }, [normalizedSearch, state])

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
    <>
      <div className="mb-8 space-y-4">
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/70 p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">
              Encontre a arte que voce procura
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Pesquise por nome da obra, artista, categoria ou trecho da
              descricao.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-muted px-3 py-1">
              {state.posts.length} obra{state.posts.length === 1 ? "" : "s"}
            </span>
            <span className="rounded-full bg-muted px-3 py-1">
              {filteredPosts.length} resultado
              {filteredPosts.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Pesquisar por artista, genero, titulo ou descricao..."
            className="h-12 rounded-full border-2 bg-background pl-10 pr-12"
            aria-label="Pesquisar artes"
          />
          {searchTerm ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
              onClick={() => setSearchTerm("")}
              aria-label="Limpar pesquisa"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          ) : null}
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-border bg-card/60 p-10 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-accent text-accent-foreground">
            <Search className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">
              Nenhum resultado encontrado
            </h2>
            <p className="mt-1 text-sm text-muted-foreground text-pretty">
              Tente pesquisar pelo nome do artista, categoria ou titulo da
              obra.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-2"
            onClick={() => setSearchTerm("")}
          >
            Limpar pesquisa
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post, i) => (
            <PostCard
              key={post.id}
              post={post}
              index={i}
              onClick={setSelectedPost}
            />
          ))}
        </div>
      )}

      <PostPreviewDialog
        open={selectedPost !== null}
        post={selectedPost}
        onUpdated={handleUpdatedPost}
        onDeleted={handleDeletedPost}
        onOpenChange={(open) => {
          if (!open) setSelectedPost(null)
        }}
      />
    </>
  )
}
