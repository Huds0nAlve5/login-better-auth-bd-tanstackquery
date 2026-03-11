# Guia de Configuração: TanStack Query

### Componente ➡️ TanStack Query (Cache) ➡️ Server Action ➡️ Prisma/Banco de Dados

## Este documento serve como um guia passo a passo para a instalação e configuração do TanStack Query

## 📦 1. Instalação do TanStack Query

### 1º Instalação das dependências

```bash
npm i @tanstack/react-query
npm i -D @tanstack/eslint-plugin-query
```

### 2º Adiciona o componentes de provider em providers/query-provider.tsx

#### Este componente vai envolver todas as páginas do projeto

```typescript
"use client"; // Precisa ser client porque o cache vive no navegador

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

## 3º Adiciona o componente "abraçando" os componentes filhos

```typescript
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="w-full h-full">
        <QueryProvider>
          <Toaster />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
```

## 4º A estrutura no front end abaixo. mutation é para alterações no banco, e a query é para gets

```typescript
const queryClient = useQueryClient();

const query = useQuery({ queryKey: ["todos"], queryFn: getTodos });

const mutation = useMutation({
  mutationFn: createClube,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["todos"] });
  },
});
```

## 5º Para atualizar a senha, no schema defini-se assim:

```typescript
export const usuarioAtualizarSenhaSchema = usuarioSchema
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "A confirmação de senha não coincide",
    path: ["confirmPassword"],
  });
```

### Desta forma, vai solicitar que o campo de senha e confirmar senha sejam iguais

## 6º Na chamada de função assíncrona no front end:

```typescript
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
```
