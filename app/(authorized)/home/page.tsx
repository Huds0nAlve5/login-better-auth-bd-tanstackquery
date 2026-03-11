"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function page() {
  const route = useRouter();

  useEffect(() => {
    async function teste() {
      const { data, error } = await authClient.phoneNumber.sendOtp({
        phoneNumber: "+55988571744", // required
      });
      console.log(data, error);
    }
    teste();
  }, []);

  return (
    <>
      <Button onClick={() => route.push("/usuarios")}>Usuarios</Button>;
    </>
  );
}
