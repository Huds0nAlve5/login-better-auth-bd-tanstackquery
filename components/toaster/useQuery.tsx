"use client";

import {
  MutationFunction,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FieldValues, UseFormReturn } from "react-hook-form";

export function formQueryCreate<T extends FieldValues>({
  func,
  queryKey,
  entidade,
  form,
  redirect_path,
}: {
  func: MutationFunction<any, T>;
  queryKey: string;
  entidade: string;
  form: UseFormReturn<T>;
  redirect_path: string;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: func,
    onMutate: () => {
      return toast.loading(`Cadastrando ${entidade}...`);
    },
    onSuccess: (data, variables, contextId) => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });

      toast.success(`${entidade} cadastrado(a) com sucesso`, {
        id: contextId as string,
      });

      form.reset();
      router.push(redirect_path);
    },
    onError: (error, variables, contextId) => {
      toast.error(
        `Erro: ${error instanceof Error ? error.message : "Falha na operação"}`,
        {
          id: contextId as string,
        },
      );
    },
  });

  return mutation;
}
