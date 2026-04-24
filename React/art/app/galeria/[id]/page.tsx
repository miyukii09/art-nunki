import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, CalendarDays } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { getPost } from "@/lib/api"
import { formatPostDate, getPostInitials } from "@/lib/post-utils"
import { Button } from "@/components/ui/button"

type Props = {
  params: Promise<{ id: string }>
}

export default async function PostDetailsPage({ params }: Props) {
  const { id } = await params
  const postId = Number(id)

  if (!Number.isFinite(postId)) {
    notFound()
  }

  let post

  try {
    post = await getPost(postId)
  } catch {
    notFound()
  }

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
        <div className="mb-6">
          <Button asChild variant="ghost" className="rounded-full">
            <Link href="/galeria" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar para a galeria
            </Link>
          </Button>
        </div>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)] lg:items-start">
          <article className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <div className="relative bg-muted">
              {
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.imageUrl || "/placeholder.svg"}
                  alt={post.title}
                  className="max-h-[78vh] w-full object-contain"
                  crossOrigin="anonymous"
                />
              }
            </div>
          </article>

          <aside className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <div className="space-y-6 p-6 md:p-8">
              <div>
                <p className="text-sm font-semibold text-primary">
                  Detalhes da arte
                </p>
                <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
                  {post.title}
                </h1>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-muted/70 p-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {getPostInitials(post.user?.name, post.user?.email)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {post.user?.name ?? "Anônimo"}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {post.user?.email ?? "Artista da comunidade Nunki"}
                  </p>
                </div>
              </div>

              {post.createdAt ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  <span>Publicado em {formatPostDate(post.createdAt)}</span>
                </div>
              ) : null}

              <div className="space-y-2">
                <h2 className="font-display text-xl font-bold">Sobre a obra</h2>
                <p className="text-sm leading-7 text-muted-foreground md:text-base">
                  {post.description?.trim() ||
                    "O artista ainda nao adicionou uma descricao para esta arte."}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-background/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Origem da imagem
                </p>
                <p className="mt-2 break-all text-sm text-muted-foreground">
                  {post.imageUrl}
                </p>
              </div>
            </div>
          </aside>
        </section>

        <footer className="mt-12 border-t border-border">
          <div className="flex flex-col gap-3 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <p>Desenvolvido por Yukii.</p>
            <div className="flex flex-col items-center gap-2 md:flex-row">
              <a
                href="https://discord.gg/mMtbt27TGe"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-foreground"
              >
                Suporte no Discord
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
