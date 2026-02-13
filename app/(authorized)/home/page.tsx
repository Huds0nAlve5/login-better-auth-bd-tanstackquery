"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function page() {
  const route = useRouter();

  return (
    <>
      <Button onClick={() => route.push("/usuarios")}>Usuarios</Button>;
    </>
  );
}
