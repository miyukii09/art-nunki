"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { resetPassword } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

type Props = {
  token: string
}

export function ResetPasswordForm({ token }: Props) {
  const router = useRouter()
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (submitting) return

    if (!token.trim()) {
      toast.error("Token de redefinicao invalido.")
      return
    }

    if (password.length < 4) {
      toast.error("A nova senha deve ter no minimo 4 caracteres.")
      return
    }

    if (password !== confirmPassword) {
      toast.error("As senhas nao conferem.")
      return
    }

    setSubmitting(true)
    try {
      await resetPassword({ token, password })
      toast.success("Senha redefinida com sucesso!")
      router.push("/login")
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Nao foi possivel redefinir a senha."
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
          <FieldLabel htmlFor="new-password">Nova senha</FieldLabel>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={4}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="confirm-password">Confirmar nova senha</FieldLabel>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={4}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
          <FieldDescription>
            Use pelo menos 4 caracteres para a nova senha.
          </FieldDescription>
        </Field>

        <Button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Redefinir senha"
          )}
        </Button>

        <FieldDescription className="text-center">
          Lembrou a senha?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Voltar para entrar
          </Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  )
}
