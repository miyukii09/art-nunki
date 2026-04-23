import { Navbar } from "@/components/navbar"
import { RegisterForm } from "@/components/register-form"

export const metadata = {
  title: "Criar conta — Nunki",
}

export default function RegisterPage() {
  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12 md:px-6 md:py-16">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            Crie sua conta
          </h1>
          <p className="mt-2 text-muted-foreground text-pretty">
            Compartilhe suas artes com o mundo em segundos.
          </p>
        </div>
        <RegisterForm />
      </main>
    </div>
  )
}
