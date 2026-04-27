"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ExternalLink, Loader2 } from "lucide-react"
import { login, requestPasswordReset } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

export function LoginForm() {
  const router = useRouter()
  const { setSession } = useAuth()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [forgotPasswordOpen, setForgotPasswordOpen] = React.useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = React.useState("")
  const [forgotPasswordSubmitting, setForgotPasswordSubmitting] =
    React.useState(false)
  const [resetUrl, setResetUrl] = React.useState<string | null>(null)

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
      const session = await login({ email: trimmedEmail, password })
      setSession(session.user, session.token)
      toast.success(`Olá, ${session.user.name || session.user.email || "artista"}!`)
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

  async function handleForgotPasswordSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (forgotPasswordSubmitting) return

    const trimmedEmail = forgotPasswordEmail.trim().toLowerCase()
    if (!trimmedEmail) {
      toast.error("Informe o email da sua conta.")
      return
    }

    setForgotPasswordSubmitting(true)
    setResetUrl(null)

    try {
      const result = await requestPasswordReset({
        email: trimmedEmail,
        appBaseUrl: window.location.origin,
      })
      setResetUrl(result.resetUrl ?? null)
      toast.success(result.message)
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Nao foi possivel iniciar a recuperacao de senha."
      toast.error(message)
    } finally {
      setForgotPasswordSubmitting(false)
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
          <div className="flex justify-end">
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-sm"
              onClick={() => {
                setForgotPasswordEmail(email.trim().toLowerCase())
                setResetUrl(null)
                setForgotPasswordOpen(true)
              }}
            >
              Esqueci minha senha
            </Button>
          </div>
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

      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recuperar senha</DialogTitle>
            <DialogDescription>
              Informe seu email para gerar um link temporario de redefinicao.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <Field>
              <FieldLabel htmlFor="forgot-password-email">Email</FieldLabel>
              <Input
                id="forgot-password-email"
                type="email"
                autoComplete="email"
                required
                value={forgotPasswordEmail}
                onChange={(event) => setForgotPasswordEmail(event.target.value)}
                placeholder="voce@exemplo.com"
              />
              <FieldDescription>
                Se o email existir, a API vai preparar um link de redefinicao.
              </FieldDescription>
            </Field>

            {resetUrl ? (
              <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm">
                <p className="font-medium text-foreground">
                  Link gerado para redefinir a senha
                </p>
                <p className="mt-2 break-all text-muted-foreground">
                  {resetUrl}
                </p>
                <Button asChild type="button" variant="outline" className="mt-3">
                  <a href={resetUrl}>
                    Abrir link de redefinicao
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Se o envio por email estiver configurado no backend, o link sera
                enviado para sua caixa de entrada. Em ambientes de teste, a API
                tambem pode devolver o link diretamente.
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setForgotPasswordOpen(false)}
              >
                Fechar
              </Button>
              <Button type="submit" disabled={forgotPasswordSubmitting}>
                {forgotPasswordSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando link...
                  </>
                ) : (
                  "Gerar link"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </form>
  )
}
