"use client"

import * as React from "react"
import { ImagePlus, Link2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"

const MAX_IMAGE_FILE_BYTES = 5 * 1024 * 1024

type Props = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  previewAlt: string
  description: string
  previewError: boolean
  onPreviewErrorChange: (hasError: boolean) => void
  urlPlaceholder?: string
}

function isDataUrl(value: string) {
  return value.trim().startsWith("data:image/")
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result)
        return
      }
      reject(new Error("Nao foi possivel ler o arquivo selecionado."))
    }
    reader.onerror = () => reject(new Error("Nao foi possivel ler o arquivo selecionado."))
    reader.readAsDataURL(file)
  })
}

export function ImageSourceField({
  id,
  label,
  value,
  onChange,
  previewAlt,
  description,
  previewError,
  onPreviewErrorChange,
  urlPlaceholder = "https://...",
}: Props) {
  const [mode, setMode] = React.useState<"url" | "file">(
    isDataUrl(value) ? "file" : "url",
  )
  const [fileError, setFileError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setMode(isDataUrl(value) ? "file" : "url")
  }, [value])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith("image/")) {
      setFileError("Escolha um arquivo de imagem valido.")
      onPreviewErrorChange(true)
      return
    }

    if (file.size > MAX_IMAGE_FILE_BYTES) {
      setFileError("Escolha uma imagem de ate 5 MB.")
      onPreviewErrorChange(true)
      return
    }

    try {
      const dataUrl = await readFileAsDataUrl(file)
      onChange(dataUrl)
      onPreviewErrorChange(false)
      setFileError(null)
    } catch (error) {
      setFileError(
        error instanceof Error
          ? error.message
          : "Nao foi possivel carregar o arquivo selecionado.",
      )
      onPreviewErrorChange(true)
    }
  }

  function switchToUrl() {
    setMode("url")
    setFileError(null)
    onPreviewErrorChange(false)
    if (isDataUrl(value)) {
      onChange("")
    }
  }

  function switchToFile() {
    setMode("file")
    setFileError(null)
    onPreviewErrorChange(false)
    if (!isDataUrl(value) && value.trim().length > 0) {
      onChange("")
    }
  }

  const showPreview = value.trim().length > 0 && !previewError && !fileError

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={mode === "url" ? "default" : "outline"}
          className="rounded-full"
          onClick={switchToUrl}
        >
          <Link2 className="mr-2 h-4 w-4" />
          URL
        </Button>
        <Button
          type="button"
          variant={mode === "file" ? "default" : "outline"}
          className="rounded-full"
          onClick={switchToFile}
        >
          <Upload className="mr-2 h-4 w-4" />
          Arquivo
        </Button>
      </div>

      {mode === "url" ? (
        <Input
          id={id}
          type="url"
          value={isDataUrl(value) ? "" : value}
          onChange={(e) => {
            setFileError(null)
            onPreviewErrorChange(false)
            onChange(e.target.value)
          }}
          placeholder={urlPlaceholder}
        />
      ) : (
        <div className="space-y-3">
          <Input
            id={id}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          <p className="text-sm text-muted-foreground">
            Escolha uma imagem do computador com ate 5 MB.
          </p>
        </div>
      )}

      <FieldDescription>{description}</FieldDescription>

      {showPreview ? (
        <div className="overflow-hidden rounded-xl border border-border bg-muted">
          {
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value || "/placeholder.svg"}
              alt={previewAlt}
              className="mx-auto max-h-80 w-auto object-contain"
              onError={() => onPreviewErrorChange(true)}
              crossOrigin="anonymous"
            />
          }
        </div>
      ) : null}

      {previewError || fileError ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {fileError || "Nao conseguimos carregar a imagem informada."}
        </p>
      ) : null}

      {!value.trim() ? (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          <ImagePlus className="h-4 w-4" />
          Nenhuma imagem selecionada ainda.
        </div>
      ) : null}
    </Field>
  )
}
