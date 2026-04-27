"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Trash2 } from "lucide-react"
import { deleteUser, updateUser } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ImageSourceField } from "@/components/image-source-field"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function ProfileForm() {
  const router = useRouter()
  const { user, setUser, logout, isLoading } = useAuth()

  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [avatarUrl, setAvatarUrl] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const [avatarPreviewError, setAvatarPreviewError] = React.useState(false)

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login")
    }
  }, [user, isLoading, router])

  React.useEffect(() => {
    if (user) {
      setName(user.name ?? "")
      setEmail(user.email ?? "")
      setAvatarUrl(user.avatarUrl ?? "")
      setAvatarPreviewError(false)
    }
  }, [user])

  React.useEffect(() => {
    setAvatarPreviewError(false)
  }, [avatarUrl])

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="sr-only">Carregando...</span>
      </div>
    )
  }

  const displayName = name.trim() || user.name || user.email || "Usuario"

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!user || submitting) return

    const trimmedName = name.trim()
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedAvatarUrl = avatarUrl.trim()

    if (!trimmedName || !trimmedEmail) {
      toast.error("Nome e email nao podem ficar vazios.")
      return
    }

    if (trimmedAvatarUrl && avatarPreviewError) {
      toast.error("A URL da foto de perfil nao carregou.")
      return
    }

    setSubmitting(true)
    try {
      const updated = await updateUser(user.id, {
        name: trimmedName,
        email: trimmedEmail,
        avatarUrl: trimmedAvatarUrl || undefined,
        password: password || undefined,
      })
      setUser(updated)
      setPassword("")
      toast.success("Perfil atualizado!")
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao atualizar."
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!user || deleting) return
    setDeleting(true)
    try {
      await deleteUser(user.id)
      toast.success("Conta excluída.")
      logout()
      router.push("/")
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao excluir conta."
      toast.error(message)
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleUpdate}
        className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8"
      >
        <FieldGroup>
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-background/80 p-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              {avatarUrl.trim() && !avatarPreviewError ? (
                <AvatarImage
                  src={avatarUrl}
                  alt={`Foto de perfil de ${displayName}`}
                  onError={() => setAvatarPreviewError(true)}
                />
              ) : null}
              <AvatarFallback className="bg-accent text-accent-foreground text-lg font-semibold">
                {displayName
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0]?.toUpperCase() ?? "")
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">Pré-visualização da foto</p>
              <p className="text-sm text-muted-foreground">
                Use um link direto para um arquivo de imagem.
              </p>
            </div>
          </div>

          <Field>
            <FieldLabel htmlFor="name">Nome</FieldLabel>
            <Input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          <ImageSourceField
            id="avatarUrl"
            label="Foto de perfil"
            value={avatarUrl}
            onChange={setAvatarUrl}
            previewAlt={`Foto de perfil de ${displayName}`}
            description="Escolha uma imagem do seu computador ou cole uma URL."
            previewError={avatarPreviewError}
            onPreviewErrorChange={setAvatarPreviewError}
          />

          <Field>
            <FieldLabel htmlFor="password">Nova senha</FieldLabel>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Deixe em branco para não alterar"
            />
            <FieldDescription>
              Só preencha se quiser trocar a senha.
            </FieldDescription>
          </Field>

          <Button
            type="submit"
            disabled={submitting}
            className="w-fit rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar alterações"
            )}
          </Button>
        </FieldGroup>
      </form>

      <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6 md:p-8">
        <h2 className="font-display text-lg font-bold text-destructive">
          Zona de perigo
        </h2>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          Excluir sua conta é uma ação permanente. Suas artes poderão
          permanecer na galeria sem autor.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="mt-4 rounded-full"
              disabled={deleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir minha conta
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Essa ação não pode ser desfeita. Sua conta Nunki será removida
                permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Sim, excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
