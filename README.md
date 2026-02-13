# Guia de Configuração: TanStack Query

### Componente ➡️ TanStack Query (Cache) ➡️ Server Action ➡️ Prisma/Banco de Dados

## Este documento serve como um guia passo a passo para a instalação e configuração do TanStack Query

## 📦 1. Instalação do TanStack Query

### 1º Instalação das dependências

```bash
npm i -D @tanstack/eslint-plugin-query
```

### 2º Adiciona o componentes de provider

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
