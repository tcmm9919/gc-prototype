"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--card)",
          "--normal-text": "var(--card-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          "--width": "380px",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          // Белый тост: иконка + текст слева, кнопки в один ряд справа (напротив текста)
          toast: "cn-toast !flex !flex-row !items-center !gap-3 !bg-card !text-card-foreground !border-border !shadow-lg",
          icon: "!m-0 mt-0.5 self-start",
          content: "!flex-1 !min-w-0",
          title: "text-sm font-medium",
          description: "!text-muted-foreground",
          actionButton: "!shrink-0 !whitespace-nowrap",
          cancelButton: "!shrink-0 !whitespace-nowrap",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
