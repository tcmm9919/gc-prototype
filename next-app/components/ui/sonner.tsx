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
          // Белый тост, контент на всю ширину, кнопки — полноширокие снизу (стек)
          toast: "cn-toast !flex !flex-col !items-stretch !gap-2 !bg-card !text-card-foreground !border-border !shadow-lg",
          icon: "!m-0 self-start",
          content: "!w-full",
          title: "!w-full text-sm font-medium",
          description: "!w-full !text-muted-foreground",
          actionButton: "!w-full !justify-center",
          cancelButton: "!w-full !justify-center",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
