import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"

export const metadata = {
  title: "GCP — Globerce Compliance Platform",
  description: "Freedom AI Compliance prototype",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" suppressHydrationWarning className="antialiased">
      <body>
        <ThemeProvider>
          <TooltipProvider delayDuration={150}>
            {children}
            <Toaster position="top-right" closeButton />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
