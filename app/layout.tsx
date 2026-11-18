import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kortify | Cortes de live prontos para Shorts e TikTok",
  description:
    "Mande a live e receba cortes verticais com legenda palavra por palavra, prontos para o YouTube Shorts e o TikTok.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-palette="claro" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var m=localStorage.getItem("kortify-modo");if(!m)m=matchMedia("(prefers-color-scheme: dark)").matches?"azul":"claro";document.documentElement.setAttribute("data-palette",m)}catch(e){}',
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
