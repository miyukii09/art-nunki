"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { login, register } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

export function RegisterForm() {
  const router = useRouter()
  const { setSession } = useAuth()
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return

    const trimmedName = name.trim()
    const trimmedEmail = email.trim().toLowerCase()

    if (password.length < 4) {
      toast.error("A senha deve ter no mínimo 4 caracteres.")
      return
    }

    if (!trimmedName || !trimmedEmail) {
      toast.error("Preencha nome e email antes de continuar.")
      return
    }

    setSubmitting(true)
    try {
      await register({ name: trimmedName, email: trimmedEmail, password })
      // o backend não retorna password, fazemos login logo em seguida para ter o id
      const session = await login({ email: trimmedEmail, password })
      setSession(session.user, session.token)
      toast.success(
        `Conta criada! Bem-vindo, ${session.user.name || session.user.email || "artista"}.`,
      )
      router.push("/")
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Não foi possível criar a conta."
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8"
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Nome</FieldLabel>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Como você quer ser chamado(a)"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@exemplo.com"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Senha</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={4}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <Button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando conta...
            </>
          ) : (
            "Criar conta"
          )}
        </Button>

        <FieldDescription className="text-center">
          Já tem uma conta?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Entrar
          </Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  )
}
