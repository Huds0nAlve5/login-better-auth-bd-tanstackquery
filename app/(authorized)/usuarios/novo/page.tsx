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
import { usuarioSchema, usuarioType } from "@/schema/usuario";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";

export default function page() {
  const form = useForm<usuarioType>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const { isSubmitting } = form.formState;
  const router = useRouter();

  async function onSubmit(values: usuarioType) {
    const toastId = toast.loading("Criando sua conta...", {
      position: "top-right",
    });

    await authClient.signUp.email(
      {
        name: values.name,
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: (ctx) => {
          toast.success("Usuário cadastrado com sucesso!", {
            id: toastId,
            position: "top-right",
          });
          form.reset();
          router.push("/"); //redirecionamento opcional
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
                <CardTitle>Cadastro de usuário</CardTitle>
                <CardDescription>Informe nome, e-mail e senha</CardDescription>
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

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
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
                    <Spinner /> Cadastrando...
                  </Button>
                ) : (
                  <Button className="cursor-pointer w-full">Cadastrar</Button>
                )}
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </>
  );
}
