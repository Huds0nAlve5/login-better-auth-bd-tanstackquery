import type { Metadata } from "next";
import "@/app/globals.css";
import MenuBarPerson from "@/components/ui/menubar-person";

export const metadata: Metadata = {
  title: "Home",
  description: "Sistema de login",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <MenuBarPerson />
      {children}
    </>
  );
}
