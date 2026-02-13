import { string, z } from "zod";

export const clubeSchema = z.object({
  nome: string().min(1, "Insira o nome do clube"),
  estado: string().min(1, "Insira o Estado"),
});

export type clubeType = z.infer<typeof clubeSchema>;
