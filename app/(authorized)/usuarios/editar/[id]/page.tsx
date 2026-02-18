"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import {
  usuarioAtualizarSenhaSchema,
  usuarioAtualizarSenhaType,
  usuarioSchema,
  usuarioType,
} from "@/schema/usuario";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { use, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { selectUniqueUsuario } from "@/actions/usuario";

interface PageProps {
  params: Promise<{ id: string }>;
}
export default function page({ params }: PageProps) {
  const { id } = use(params);

  const form = useForm<usuarioAtualizarSenhaType>({
    resolver: zodResolver(usuarioAtualizarSenhaSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const query = useQuery({
    queryKey: ["usuarios", id],
    queryFn: () => {
      return selectUniqueUsuario(id);
    },
  });

  useEffect(() => {
    function carregarUsuario() {
      const usuario = query.data;
      form.reset({
        name: usuario?.name,
        email: usuario?.email,
      });
    }

    carregarUsuario();
  }, [query.data, form]);

  const { isSubmitting } = form.formState;
  const router = useRouter();

  async function onSubmit(values: usuarioAtualizarSenhaType) {
    const toastId = toast.loading("Alterando sua conta...", {
      position: "top-right",
    });

    await authClient.changePassword(
      {
        currentPassword: "9CFz2gd.!ceXs8F",
        newPassword: values.password,
      },
      {
        onSuccess: (ctx) => {
          toast.success("Usuário cadastrado com sucesso!", {
            id: toastId,
            position: "top-right",
          });
          form.reset();
          router.push("/home"); //redirecionamento opcional
        },
        onError: (ctx) => {
          // O Better-Auth já devolve a mensagem de erro amigável (ex: e-mail já existe)
          ctx.error.code == "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
            ? toast.error("E-mail já cadastrado", {
                id: toastId,
                position: "top-right",
              })
            : toast.error(ctx.error.message, {
                id: toastId,
                position: "top-right",
              });
        },
      },
    );
  }

  return (
    <>
      <div className="flex justify-center items-center h-screen">
        <Card>
          <Form {...form}>
            <form
              className="w-120 space-y-6"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <CardHeader>
                <CardTitle>Alteração de usuário</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input {...field}></Input>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input {...field}></Input>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* 
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha Atual</FormLabel>
                      <FormControl>
                        <Input {...field} type="password"></Input>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova senha</FormLabel>
                      <FormControl>
                        <Input {...field} type="password"></Input>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar senha</FormLabel>
                      <FormControl>
                        <Input {...field} type="password"></Input>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>

              <CardFooter className="mt-7">
                {isSubmitting ? (
                  <Button className="cursor-pointer w-full" disabled>
                    <Spinner /> Atualizando...
                  </Button>
                ) : (
                  <Button className="cursor-pointer w-full">Atualizar</Button>
                )}
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </>
  );
}
