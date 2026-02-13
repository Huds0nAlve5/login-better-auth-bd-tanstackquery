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
