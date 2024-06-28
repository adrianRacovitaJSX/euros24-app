import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/Header";

const dmsans = DM_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title:
    "¡Predice la Eurocopa 2024! - Demuestra tus conocimientos futbolísticos",
  description:
    "¿Eres un experto en fútbol? ¡Demuéstralo! Predice los resultados de la Eurocopa 2024, desde la fase de grupos hasta la gran final.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={dmsans.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
