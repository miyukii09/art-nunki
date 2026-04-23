import { Navbar } from "@/components/navbar"
import { LoginForm } from "@/components/login-form"

export const metadata = {
  title: "Entrar — Nunki",
}

export default function LoginPage() {
  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12 md:px-6 md:py-16">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            Bem-vindo de volta
          </h1>
          <p className="mt-2 text-muted-foreground text-pretty">
            Entre para publicar novas artes.
          </p>
        </div>
        <LoginForm />
      </main>
    </div>
  )
}
