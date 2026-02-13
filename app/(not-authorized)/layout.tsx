import type { Metadata } from "next";
import "@/app/globals.css";
import { Toaster } from "sonner";
import MenuBarPerson from "@/components/ui/menubar-person";

export const metadata: Metadata = {
  title: "Login System",
  description: "Sistema de login",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
