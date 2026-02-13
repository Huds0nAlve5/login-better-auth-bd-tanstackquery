"use client";
import { selectUsuarios } from "@/actions/usuario";
import { Spinner } from "@/components/ui/spinner";
import { useEffect, useState } from "react";

export default function page() {
  const [prismaPending, setPrismaPending] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    async function getUsers() {
      setPrismaPending(true);
      try {
        const response = await selectUsuarios();
        if (response.usuarios) {
          setUsers(response.usuarios);
        }
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      } finally {
        // 4. Mude para false para esconder o Spinner
        setPrismaPending(false);
      }
    }

    getUsers();
  }, []);

  if (prismaPending) {
    return (
      <>
        <Spinner />
      </>
    );
  } else {
    return (
      <>
        <ul>
          {users!.map((user) => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      </>
    );
  }
}
