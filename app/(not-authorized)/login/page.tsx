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
import { usuarioLoginSchema, usuarioLoginType } from "@/schema/usuario";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function page() {
  const [rememberMe, setRememberMe] = useState(false);

  const form = useForm<usuarioLoginType>({
    resolver: zodResolver(usuarioLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { isSubmitting } = form.formState;
  const router = useRouter();

  async function onSubmit(values: usuarioLoginType) {
    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
        rememberMe: rememberMe,
      },
      {
        onSuccess: (ctx) => {
          form.reset();
          router.push("/home"); //redirecionamento opcional
        },
        onError: (ctx) => {
          toast.error(ctx.error.message, {
            position: "top-right",
          });
        },
      },
    );
  }

  const handleGoogleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/home",
    });
  };

  return (
    <>
      <div className="flex justify-center items-center h-screen">
        <Card>
          <Form {...form}>
            <form
              className="w-100 space-y-6"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>Informe e-mail e senha</CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
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
                        <Input
                          {...field}
                          type="password"
                          autoComplete="off"
                        ></Input>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2 cursor-pointer">
                  <Checkbox
                    className=" cursor-pointer"
                    id="rememberMeCheckBox"
                    checked={rememberMe}
                    onCheckedChange={(rememberMe) =>
                      setRememberMe(!!rememberMe)
                    }
                  />
                  <Label
                    className="cursor-pointer text-gray-500"
                    htmlFor="rememberMeCheckBox"
                  >
                    Lembrar de mim
                  </Label>
                </div>
              </CardContent>

              <CardFooter className="mt-7 block space-y-2">
                {isSubmitting ? (
                  <Button className="cursor-pointer w-full" disabled>
                    <Spinner /> Realizando login...
                  </Button>
                ) : (
                  <Button className="cursor-pointer w-full">Login</Button>
                )}

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleLogin}
                  className="w-full cursor-pointer"
                >
                  Entrar com Google
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </>
  );
}
