"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { login } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

export function LoginForm() {
  const router = useRouter()
  const { setUser } = useAuth()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail || !password) {
      toast.error("Informe email e senha para entrar.")
      return
    }

    setSubmitting(true)
    try {
      const user = await login({ email: trimmedEmail, password })
      setUser(user)
      toast.success(`Olá, ${user.name || user.email}!`)
      router.push("/")
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Não foi possível entrar."
      toast.error(
        message.includes("Credenciais") ? "Credenciais inválidas" : message,
      )
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
            autoComplete="current-password"
            required
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
              Entrando...
            </>
          ) : (
            "Entrar"
          )}
        </Button>

        <FieldDescription className="text-center">
          Não tem uma conta?{" "}
          <Link
            href="/register"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Criar conta
          </Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  )
}
