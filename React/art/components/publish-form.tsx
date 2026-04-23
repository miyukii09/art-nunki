"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { createPost } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

export function PublishForm() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [imageUrl, setImageUrl] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [previewError, setPreviewError] = React.useState(false)

  // Proteção client-side: se não estiver logado, manda para o login
  React.useEffect(() => {
    if (!isLoading && !user) {
      toast.error("Você precisa entrar para publicar.")
      router.replace("/login")
    }
  }, [user, isLoading, router])

  React.useEffect(() => {
    setPreviewError(false)
  }, [imageUrl])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || submitting) return

    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()
    const trimmedImageUrl = imageUrl.trim()

    if (!trimmedTitle || !trimmedImageUrl) {
      toast.error("Informe um titulo e uma URL de imagem valida.")
      return
    }

    setSubmitting(true)
    try {
      await createPost({
        title: trimmedTitle,
        description: trimmedDescription,
        imageUrl: trimmedImageUrl,
        userId: user.id,
      })
      toast.success("Arte publicada!")
      router.push("/")
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao publicar."
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="sr-only">Carregando...</span>
      </div>
    )
  }

  const showPreview = imageUrl.trim().length > 0 && !previewError

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8"
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="imageUrl">URL da imagem</FieldLabel>
          <Input
            id="imageUrl"
            type="url"
            required
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
          />
          <FieldDescription>
            A API atual salva apenas o endereco da imagem. Cole o link direto
            para um arquivo .jpg, .png, .webp ou .gif.
          </FieldDescription>
        </Field>

        {showPreview ? (
          <div className="overflow-hidden rounded-xl border border-border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl || "/placeholder.svg"}
              alt="Pré-visualização da arte"
              className="mx-auto max-h-80 w-auto object-contain"
              onError={() => setPreviewError(true)}
              crossOrigin="anonymous"
            />
          </div>
        ) : previewError ? (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Não conseguimos carregar a imagem dessa URL.
          </p>
        ) : null}

        <Field>
          <FieldLabel htmlFor="title">Título</FieldLabel>
          <Input
            id="title"
            type="text"
            required
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Noite em aquarela"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="description">Descrição</FieldLabel>
          <Textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Conte um pouco sobre a sua arte..."
          />
        </Field>

        <div className="flex flex-wrap gap-3">
          <Button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publicando...
              </>
            ) : (
              "Publicar arte"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-2"
            onClick={() => router.push("/")}
          >
            Cancelar
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
