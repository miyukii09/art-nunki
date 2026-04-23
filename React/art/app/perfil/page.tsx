import { Navbar } from "@/components/navbar"
import { ProfileForm } from "@/components/profile-form"

export const metadata = {
  title: "Meu perfil — Nunki",
}

export default function PerfilPage() {
  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-12 md:px-6 md:py-16">
        <div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            Meu perfil
          </h1>
          <p className="mt-2 text-muted-foreground text-pretty">
            Atualize seus dados ou encerre sua conta.
          </p>
        </div>
        <ProfileForm />
      </main>
    </div>
  )
}
