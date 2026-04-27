import { Navbar } from "@/components/navbar"
import { ResetPasswordForm } from "@/components/reset-password-form"

export const metadata = {
  title: "Redefinir senha — Nunki",
}

type Props = {
  searchParams: Promise<{ token?: string }>
}

export default async function ResetPasswordPage({ searchParams }: Props) {
  const params = await searchParams
  const token = params.token?.trim() ?? ""

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12 md:px-6 md:py-16">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            Redefinir senha
          </h1>
          <p className="mt-2 text-muted-foreground text-pretty">
            Crie uma nova senha para voltar a acessar sua conta.
          </p>
        </div>

        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm md:p-8">
            <p className="text-sm text-muted-foreground">
              O link de redefinicao esta incompleto ou invalido.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
