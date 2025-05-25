import './globals.css'
import type React from "react"
import { SupportButton } from "@/components/support-button"
import { SOSButton } from "@/components/sos-button"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata = {
  title: 'Voting System',
  description: 'Secure Digital Voting Platform',
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          {children}
          <SupportButton />
          <SOSButton />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
