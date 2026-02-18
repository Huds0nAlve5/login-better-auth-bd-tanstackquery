import { email, string, z } from "zod";

export const usuarioSchema = z.object({
  name: z.string().min(1, "Insira o nome"),
  email: z.email("Insira um e-mail válido"),
  password: z.string().min(8, "Insira ao menos 8 caracteres"),
});

export const usuarioLoginSchema = z.object({
  email: z.email("Insira um e-mail válido"),
  password: z.string().min(1, "A senha é obrigatória"),
});

export const usuarioAtualizarSenhaSchema = usuarioSchema
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "A confirmação de senha não coincide",
    path: ["confirmPassword"],
  });

export type usuarioType = z.infer<typeof usuarioSchema>;
export type usuarioLoginType = z.infer<typeof usuarioLoginSchema>;
export type usuarioAtualizarSenhaType = z.infer<
  typeof usuarioAtualizarSenhaSchema
>;
