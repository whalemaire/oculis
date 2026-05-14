import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from './components/AuthProvider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Figla — Trouvez vos lunettes parfaites',
  description: "Figla scanne votre visage pour recommander les montures adaptées à votre morphologie et vous géolocalise l'opticien le plus proche avec votre paire en stock.",
  keywords: 'lunettes, opticien, scan visage, recommandation montures, forme visage',
  openGraph: {
    title: 'Figla — Trouvez vos lunettes parfaites',
    description: 'Scannez votre visage et trouvez vos lunettes idéales près de chez vous.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider><Suspense fallback={null}>{children}</Suspense></AuthProvider>
      </body>
    </html>
  );
}
