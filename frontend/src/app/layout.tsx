import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KambioP2P - Intercambio de Divisas P2P",
  description: "Plataforma digital P2P que facilita el intercambio de dólares y soles en el mercado peruano",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
