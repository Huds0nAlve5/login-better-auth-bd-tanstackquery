"use server";

import prisma from "@/lib/prisma";

export type retornoUsuario = {
  error?: String;
  sucess?: boolean;
  usuarios?: any[];
};

export async function selectUsuarios() {
  return await prisma.user.findMany({ orderBy: { name: "asc" } });
}

export async function selectUniqueUsuario(id: string) {
  return await prisma.user.findUnique({ where: { id: id } });
}
