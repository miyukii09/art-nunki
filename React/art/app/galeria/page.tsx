import { Gallery } from "@/components/gallery"
import { Navbar } from "@/components/navbar"

export default function GalleryPage() {
  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main>
        <section className="border-b border-border bg-card/40">
          <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
            <p className="text-sm font-semibold text-primary">
              Galeria da comunidade
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold tracking-tight md:text-5xl">
              Todas as artes em um so lugar
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              Explore as publicacoes recentes dos artistas da Nunki em uma tela
              dedicada, sem precisar rolar a pagina inicial.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
          <Gallery />
        </section>

        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
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
