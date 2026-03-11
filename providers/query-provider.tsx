"use client";

import {
  MutationCache,
  mutationOptions,
  QueryClient,
  QueryClientProvider,
  QueryKey,
} from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => {
    let toastId: string | number;
    return new QueryClient({
      mutationCache: new MutationCache({
        onMutate: () => (toastId = toast.loading("Aplicando alterações...")),
        onSuccess: () =>
          toast.success("Operação realizada com sucesso!", { id: toastId }),
        onError: (error) =>
          toast.error(`Erro na operação ${error.message}`, { id: toastId }),
      }),
    });
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
