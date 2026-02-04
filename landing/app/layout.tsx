import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Caro-Services | Déclarations fiscales Luxembourg - 40% moins cher',
  description: 'Vos déclarations TVA, impôts et comptabilité au Luxembourg. Spécialiste frontaliers FR→LU. ~40% moins cher que les fiduciaires.',
  keywords: 'déclaration TVA Luxembourg, impôts Luxembourg, frontalier France Luxembourg, expert-comptable Luxembourg, fiduciaire Luxembourg',
  openGraph: {
    title: 'Caro-Services | Déclarations fiscales Luxembourg',
    description: 'Vos déclarations TVA, impôts et comptabilité au Luxembourg. ~40% moins cher que les fiduciaires.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
