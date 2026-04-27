"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { createPost } from "@/lib/api"
import { ImageSourceField } from "@/components/image-source-field"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { POST_CATEGORIES } from "@/lib/post-categories"

export function PublishForm() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [imageUrl, setImageUrl] = React.useState("")
  const [category, setCategory] = React.useState("")
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
    const trimmedCategory = category.trim()

    if (!trimmedTitle || !trimmedImageUrl || !trimmedCategory) {
      toast.error("Informe titulo, categoria e uma URL de imagem valida.")
      return
    }

    if (previewError) {
      toast.error("A URL da imagem nao carregou. Use um link direto para a arte.")
      return
    }

    setSubmitting(true)
    try {
      await createPost({
        title: trimmedTitle,
        description: trimmedDescription,
        imageUrl: trimmedImageUrl,
        category: trimmedCategory,
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

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8"
    >
      <FieldGroup>
        <ImageSourceField
          id="imageUrl"
          label="Imagem da arte"
          value={imageUrl}
          onChange={setImageUrl}
          previewAlt="Pre-visualizacao da arte"
          description="Escolha uma imagem do computador ou cole uma URL direta."
          previewError={previewError}
          onPreviewErrorChange={setPreviewError}
        />

        <Field>
          <FieldLabel htmlFor="category">Categoria</FieldLabel>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category" className="w-full">
              <SelectValue placeholder="Selecione a categoria da arte" />
            </SelectTrigger>
            <SelectContent>
              {POST_CATEGORIES.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldDescription>
            Isso ajuda quem visita a galeria a entender rapidamente o estilo da obra.
          </FieldDescription>
        </Field>

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
