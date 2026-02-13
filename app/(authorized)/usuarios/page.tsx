"use client";

import { selectUsuarios } from "@/actions/usuario";
import { Spinner } from "@/components/ui/spinner";
import { useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

export default function page() {
  const queryClient = useQueryClient();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["todos"],
    queryFn: selectUsuarios,
  });
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ul>
          {data?.map((user) => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      </QueryClientProvider>
    </>
  );
}
