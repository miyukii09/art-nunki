"use client"

import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

export function Hero() {
  const { user } = useAuth()

  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* blobs decorativos (sutis) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-magenta/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-32 h-72 w-72 rounded-full bg-brand-yellow/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/3 h-60 w-60 rounded-full bg-brand-teal/20 blur-3xl"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-20 text-center md:py-28 md:px-6">
        <span className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground transition-all duration-300 hover:border-primary/50 hover:shadow-md">
          <Sparkles
            className="h-4 w-4 text-primary transition-transform duration-500 group-hover:rotate-12 group-hover:scale-125"
            aria-hidden="true"
          />
          Galeria aberta para todos
        </span>

        <h1 className="font-display text-5xl font-black leading-[1.05] tracking-tight text-balance md:text-7xl">
          Onde a arte{" "}
          <span className="relative inline-block">
            <span className="relative z-10 text-primary">brilha</span>
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-1 -z-0 h-3 bg-brand-yellow/60 md:bottom-2 md:h-4"
            />
          </span>
          .
        </h1>

        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty md:text-xl">
          Nunki é o espaço colorido onde artistas divulgam suas criações,
          encontram público e inspiram outros criadores. Navegue livremente —
          publicar é só para quem tem conta.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {user ? (
            <Button
              asChild
              size="lg"
              className="group rounded-full animate-pulse-glow"
            >
              <Link href="/publicar" className="gap-2">
                Publicar uma arte
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                size="lg"
                className="group rounded-full animate-pulse-glow"
              >
                <Link href="/register" className="gap-2">
                  Criar conta de artista
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-2"
              >
                <Link href="#galeria">Ver galeria</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
