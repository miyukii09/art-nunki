"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, LogOut, User as UserIcon, Palette } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
}

export function Navbar() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const displayName = user?.name || user?.email || "Usuario"

  function handleLogout() {
    logout()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-xl font-bold tracking-tight"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Palette className="h-4 w-4" aria-hidden="true" />
          </span>
          <span>Nunki</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" className="rounded-full">
            <Link href="/galeria">Galeria</Link>
          </Button>

          <ThemeToggle />

          {isLoading ? null : user ? (
            <>
              <Button
                asChild
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Link href="/publicar" className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Publicar</span>
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="Menu do usuário"
                    className="rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Avatar className="h-9 w-9 border-2 border-primary">
                      {user.avatarUrl ? (
                        <AvatarImage
                          src={user.avatarUrl}
                          alt={`Foto de perfil de ${displayName}`}
                        />
                      ) : null}
                      <AvatarFallback className="bg-accent text-accent-foreground font-semibold">
                        {getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-semibold">{displayName}</span>
                      <span className="text-xs font-normal text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/perfil" className="cursor-pointer">
                      <UserIcon className="mr-2 h-4 w-4" />
                      Meu perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" className="rounded-full">
                <Link href="/login">Entrar</Link>
              </Button>
              <Button
                asChild
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Link href="/register">Criar conta</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
