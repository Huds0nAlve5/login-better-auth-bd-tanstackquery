import type { Metadata } from "next";
import "@/app/globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Login System",
  description: "Sistema de login",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="w-full h-full">
        <Toaster />
        {children}
      </body>
    </html>
  );
}
