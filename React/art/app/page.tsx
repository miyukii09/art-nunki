import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import Link from "next/link"
import { Button } from "@/components/ui/button"

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
                Como funciona
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold">
                Descubra artes da comunidade
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                A galeria reune as publicacoes dos artistas em um so lugar.
                Voce pode abrir cada arte, pesquisar por artista, categoria ou
                titulo e explorar tudo com mais facilidade.
              </p>
            </article>

            <article className="rounded-2xl border border-border bg-background/90 p-5 shadow-sm">
              <p className="text-sm font-semibold text-brand-teal">
                Publique com facilidade
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold">
                Envie sua arte por arquivo ou URL
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Quem cria uma conta pode publicar obras escolhendo uma imagem do
                proprio computador ou colando um link, alem de preencher titulo,
                descricao e categoria.
              </p>
            </article>

            <article className="rounded-2xl border border-border bg-background/90 p-5 shadow-sm">
              <p className="text-sm font-semibold text-brand-yellow">
                Controle da sua obra
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold">
                Edite ou remova quando quiser
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                O autor da publicacao pode atualizar informacoes da arte,
                trocar imagem, ajustar categoria ou excluir a postagem de forma
                simples pela propria galeria.
              </p>
            </article>
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <div className="grid gap-8 px-6 py-10 md:grid-cols-[1.2fr_0.8fr] md:px-10 md:py-14">
              <div>
                <p className="text-sm font-semibold text-primary">
                  Galeria em tela dedicada
                </p>
                <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
                  Explore as artes em uma página só para elas
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                  Agora a galeria ganhou uma tela própria para deixar a home
                  mais leve e levar o visitante direto para as publicações da
                  comunidade.
                </p>
              </div>

              <div className="flex items-center justify-start md:justify-end">
                <Button asChild size="lg" className="rounded-full">
                  <Link href="/galeria">Abrir galeria</Link>
                </Button>
              </div>
            </div>
          </div>
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
