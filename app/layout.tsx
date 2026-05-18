import { Plus_Jakarta_Sans, DM_Mono } from 'next/font/google'
import './globals.css'
import { ServiceWorkerRegistrar } from '@/components/ServiceWorkerRegistrar'
import { AuthProvider } from '@/hooks/useAuth'

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'], 
  variable: '--font-jakarta' 
})

const mono = DM_Mono({ 
  subsets: ['latin'], 
  weight: ['400','500'], 
  variable: '--font-mono' 
})

export const metadata = {
  title: 'QMeR+ OR/DR Companion',
  description: 'Ormoc District Hospital OR/DR Companion System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${jakarta.variable} ${mono.variable}`}>
      <body className="antialiased bg-(--bg-base)">
        <ServiceWorkerRegistrar />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}