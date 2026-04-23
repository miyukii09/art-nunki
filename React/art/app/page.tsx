import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Gallery } from "@/components/gallery"
import { getApiLabel } from "@/lib/api"

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main>
        <Hero />
        <section className="border-b border-border bg-card/50">
          <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 md:grid-cols-3 md:px-6">
            <article className="rounded-2xl border border-border bg-background/90 p-5 shadow-sm">
              <p className="text-sm font-semibold text-primary">
                Integracao pronta
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold">
                Front alinhado com a API Nunki
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                O fluxo atual usa `POST /auth/register`, `POST /auth/login` e
                `GET /posts` para deixar a galeria aberta e a publicacao
                restrita a usuarios logados.
              </p>
            </article>

            <article className="rounded-2xl border border-border bg-background/90 p-5 shadow-sm">
              <p className="text-sm font-semibold text-brand-teal">
                Backend esperado
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold">
                Spring em {getApiLabel()}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Se a galeria falhar, o front agora mostra um erro mais direto
                para facilitar o diagnostico de CORS, URL errada ou backend
                desligado.
              </p>
            </article>

            <article className="rounded-2xl border border-border bg-background/90 p-5 shadow-sm">
              <p className="text-sm font-semibold text-brand-yellow">
                Publicacao simples
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold">
                A API salva metadados
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                A imagem continua vindo de uma URL externa, entao o formulario
                passou a destacar isso com preview e validacoes mais claras.
              </p>
            </article>
          </div>
        </section>
        <section
          id="galeria"
          aria-labelledby="galeria-title"
          className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16"
        >
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2
                id="galeria-title"
                className="font-display text-3xl font-bold md:text-4xl"
              >
                Galeria
              </h2>
              <p className="mt-1 text-muted-foreground">
                Artes recentes publicadas por artistas da comunidade.
              </p>
            </div>
          </div>

          <Gallery />
        </section>

        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-8 text-sm text-muted-foreground md:flex-row md:px-6">
            <p>Nunki. Feito com cor.</p>
            <p>
              API:{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                {getApiLabel()}
              </code>
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}
