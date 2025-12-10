import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import { UserProvider } from "@/components/providers/UserProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";



export const metadata: Metadata = {
  title: "Paymee - Professional Fintech Dashboard",
  description: "A comprehensive financial dashboard for managing your finances, transactions, and investments in Nigeria.",
  icons: {
    icon: "/paymeelogo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,100..700;1,100..700&family=Raleway:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider>
          <UserProvider>
            {children}
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
