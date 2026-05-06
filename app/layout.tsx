import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from './components/AuthProvider'

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: 'Oculis — Trouvez vos lunettes parfaites',
  description: 'Oculis scanne votre visage pour recommander les montures adaptées à votre morphologie et vous géolocalise l\'opticien le plus proche avec votre paire en stock.',
  keywords: 'lunettes, opticien, scan visage, recommandation montures, forme visage',
  openGraph: {
    title: 'Oculis — Trouvez vos lunettes parfaites',
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
