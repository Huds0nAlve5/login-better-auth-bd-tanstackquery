"use client";

import { createClube } from "@/actions/clube";
import { formQueryCreate } from "@/components/toaster/useQuery";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { clubeSchema, clubeType } from "@/schema/clube";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export default function page() {
  const route = useRouter();

  const form = useForm<clubeType>({
    resolver: zodResolver(clubeSchema),
    defaultValues: {
      nome: "",
      estado: "",
    },
  });

  const { mutate, isPending } = formQueryCreate({
    func: createClube,
    queryKey: "clubes",
    entidade: "Clube",
    form: form,
    redirect_path: "/clubes",
  });

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => mutate(data))}
          className="flex justify-center items-center mt-34"
        >
          <Card className="w-100">
            <CardHeader>
              <CardTitle>Cadastro de clube</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do clube</FormLabel>
                    <FormControl>
                      <Input {...field}></Input>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <Input {...field}></Input>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button className="w-full cursor-pointer">Cadastrar</Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </>
  );
}
