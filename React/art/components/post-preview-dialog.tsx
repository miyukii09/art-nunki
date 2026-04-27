"use client"

import * as React from "react"
import { CalendarDays, Pencil, Trash2, Loader2 } from "lucide-react"
import type { Post } from "@/lib/api"
import { deletePost, updatePost } from "@/lib/api"
import { ImageSourceField } from "@/components/image-source-field"
import { formatPostDate, getPostInitials } from "@/lib/post-utils"
import { POST_CATEGORIES } from "@/lib/post-categories"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  post: Post | null
  onUpdated: (post: Post) => void
  onDeleted: (postId: number) => void
}

export function PostPreviewDialog({
  open,
  onOpenChange,
  post,
  onUpdated,
  onDeleted,
}: Props) {
  const { user } = useAuth()
  const isOwner = Boolean(user && post?.user?.id === user.id)
  const authorName = post?.user?.name || post?.user?.email || "Anônimo"
  const authorEmail = post?.user?.email || "Artista da comunidade Nunki"

  const [isEditing, setIsEditing] = React.useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [imageUrl, setImageUrl] = React.useState("")
  const [category, setCategory] = React.useState("")
  const [previewError, setPreviewError] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!post) return
    setTitle(post.title)
    setDescription(post.description ?? "")
    setImageUrl(post.imageUrl)
    setCategory(post.category ?? "")
    setPreviewError(false)
    setError(null)
    setIsEditing(false)
    setConfirmDeleteOpen(false)
    setSubmitting(false)
    setDeleting(false)
  }, [post, open])

  React.useEffect(() => {
    setPreviewError(false)
  }, [imageUrl])

  if (!post) return null
  const currentPost = post

  async function handleSave() {
    if (!user || !isOwner || submitting) return

    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()
    const trimmedImageUrl = imageUrl.trim()
    const trimmedCategory = category.trim()

    if (!trimmedTitle || !trimmedImageUrl || !trimmedCategory) {
      setError("Informe titulo, categoria e uma URL de imagem valida.")
      return
    }

    if (previewError) {
      setError("A URL da imagem nao carregou. Use um link direto para a arte.")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const updated = await updatePost(currentPost.id, {
        title: trimmedTitle,
        description: trimmedDescription,
        imageUrl: trimmedImageUrl,
        category: trimmedCategory,
      })
      onUpdated(updated)
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao editar a arte.")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!user || !isOwner || deleting) return

    setDeleting(true)
    setError(null)

    try {
      await deletePost(currentPost.id)
      setConfirmDeleteOpen(false)
      onDeleted(currentPost.id)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir a arte.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!submitting && !deleting) onOpenChange(nextOpen)
        }}
      >
        <DialogContent className="max-h-[92vh] max-w-5xl overflow-hidden border-border bg-card p-0 sm:max-w-5xl">
          <DialogTitle className="sr-only">{post.title}</DialogTitle>

          <div className="grid max-h-[92vh] gap-0 overflow-hidden lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
            <div className="flex items-center justify-center bg-muted/60 p-4 md:p-6">
              {
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl || "/placeholder.svg"}
                  alt={title || post.title}
                  className="max-h-[72vh] w-full rounded-2xl object-contain"
                  crossOrigin="anonymous"
                  onError={() => setPreviewError(true)}
                />
              }
            </div>

            <div className="overflow-y-auto p-6 md:p-8">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-primary">
                    {isEditing ? "Editando arte" : "Visualizacao da arte"}
                  </p>
                  {isEditing ? (
                    <div className="mt-3 space-y-3">
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {POST_CATEGORIES.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="h-12 text-lg font-semibold"
                        placeholder="Titulo da arte"
                      />
                    </div>
                  ) : (
                    <>
                      <span className="mt-3 inline-flex rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                        {post.category || "Sem categoria"}
                      </span>
                      <h2 className="mt-2 font-display text-3xl font-bold tracking-tight">
                        {post.title}
                      </h2>
                    </>
                  )}
                </div>

                {isOwner ? (
                  <div className="flex shrink-0 gap-2">
                    {isEditing ? null : (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="rounded-full"
                        onClick={() => setIsEditing(true)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="rounded-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setConfirmDeleteOpen(true)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : null}
              </div>

              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-muted/70 p-4">
                <Avatar className="h-11 w-11 shrink-0">
                  {post.user?.avatarUrl ? (
                    <AvatarImage
                      src={post.user.avatarUrl}
                      alt={`Foto de perfil de ${authorName}`}
                    />
                  ) : null}
                  <AvatarFallback className="bg-primary text-sm font-bold text-primary-foreground">
                    {getPostInitials(post.user?.name, post.user?.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {authorName}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {authorEmail}
                  </p>
                </div>
              </div>

              {post.createdAt ? (
                <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  <span>Publicado em {formatPostDate(post.createdAt)}</span>
                </div>
              ) : null}

              {isEditing ? (
                <div className="mt-6 space-y-4">
                  <ImageSourceField
                    id="edit-image"
                    label="Imagem da arte"
                    value={imageUrl}
                    onChange={setImageUrl}
                    previewAlt={title || post.title}
                    description="Escolha um arquivo do computador ou cole uma URL."
                    previewError={previewError}
                    onPreviewErrorChange={setPreviewError}
                  />

                  <div>
                    <p className="mb-2 text-sm font-medium">Descricao</p>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={6}
                      placeholder="Conte um pouco sobre a sua arte..."
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-6 space-y-2">
                  <h3 className="font-display text-xl font-bold">
                    Sobre a obra
                  </h3>
                  <p className="text-sm leading-7 text-muted-foreground md:text-base">
                    {post.description?.trim() ||
                      "O artista ainda nao adicionou uma descricao para esta arte."}
                  </p>
                </div>
              )}

              {error ? (
                <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </p>
              ) : null}

              {isEditing ? (
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    className="rounded-full"
                    onClick={handleSave}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar alteracoes"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                      onClick={() => {
                        setIsEditing(false)
                        setTitle(post.title)
                        setDescription(post.description ?? "")
                        setImageUrl(post.imageUrl)
                        setCategory(post.category ?? "")
                        setPreviewError(false)
                        setError(null)
                      }}
                    disabled={submitting}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir esta arte?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa acao remove a publicacao da galeria. Apenas o autor pode fazer isso.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full" disabled={deleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault()
                void handleDelete()
              }}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir arte"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
