"use server";

import prisma from "@/lib/prisma";

export type retornoUsuario = {
  error?: String;
  sucess?: boolean;
  usuarios?: any[];
};

export async function selectUsuarios(): Promise<retornoUsuario> {
  try {
    const usuarios = await prisma.user.findMany({ orderBy: { name: "asc" } });

    return { sucess: true, usuarios: usuarios };
  } catch (e) {
    return { error: `Erro: ${e}` };
  }
}
