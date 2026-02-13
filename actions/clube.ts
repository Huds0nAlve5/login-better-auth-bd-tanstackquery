"use server";

import { clubeType } from "@/schema/clube";
import prisma from "@/lib/prisma";

export async function createClube(clube: clubeType) {
  return await prisma.clube.create({
    data: {
      nome: clube.nome,
      estado: clube.estado,
    },
  });
}
