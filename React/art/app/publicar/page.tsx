import { Navbar } from "@/components/navbar"
import { PublishForm } from "@/components/publish-form"

export const metadata = {
  title: "Publicar arte — Nunki",
}

export default function PublicarPage() {
  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-12 md:px-6 md:py-16">
        <div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            Publicar uma arte
          </h1>
          <p className="mt-2 text-muted-foreground text-pretty">
            Cole a URL da imagem da sua arte, dê um título e descreva-a.
          </p>
        </div>
        <PublishForm />
      </main>
    </div>
  )
}
