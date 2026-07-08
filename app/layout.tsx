import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Fraunces, Geist } from 'next/font/google'
import { ThemeProvider } from '@/lib/theme-context'
import './globals.css'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
})

export const metadata: Metadata = {
  title: 'North — Financial OS for newcomers',
  description:
    'A calm, premium personal finance app for international students and temporary residents. Track balances, reserved money, safe daily spending, upcoming events, and goals.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#12181F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geist.variable} ${fraunces.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-background font-sans antialiased">
        <ThemeProvider>
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </ThemeProvider>
      </body>
    </html>
  )
}
