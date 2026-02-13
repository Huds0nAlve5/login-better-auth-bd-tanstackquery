# Guia de Configuração: Prisma + Better-Auth

Este documento serve como um guia passo a passo para a instalação e configuração do banco de dados (Prisma) e autenticação (Better-Auth) em um projeto Next.js.

---

## 📦 1. Instalação do Prisma

### 1º Instalação das dependências

```bash
npm install prisma --save-dev
npm install @prisma/client
npm install @prisma/adapter-pg
```

### 2º Inicialização

```bash
npx prisma init
```

### 3º Variáveis de Ambiente

Configure a variável DATABASE_URL no seu arquivo .env com a string de conexão do PostgreSQL.

### 4º Configuração do Schema (prisma/schema.prisma) usando schemas de auth para o better-auth, e public para tabelas do sistema

### IMPORTANTE: O generator deve ser configurado exatamente como abaixo para evitar erros de importação.

Exemplo de código

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  schemas  = ["public", "auth"]    // Define os schemas permitidos
}

model Visao {
  id String @id @default(dbgenerated("uuidv7()")) @db.Uuid
  nome String
  link String
  cpf String @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@schema("public")
}
```

### 5º e 6º Configuração do Singleton (lib/prisma.ts)

Crie a pasta lib e o arquivo prisma.ts com o conteúdo abaixo para garantir uma conexão global segura:

```typescript
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// 1. Criamos uma função ou variável para guardar o cliente
// Nota: Certifique-se de ajustar a instância do adaptador conforme a documentação do pg/adapter
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter });
};

// 2. Definimos um tipo para o objeto global
declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

// 3. Se já existir no 'global', usa o que tem.
// Se não (como na primeira vez), cria um novo.
const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

// 4. Em desenvolvimento, salva no global para não criar outro no recarregamento
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
```

# 🔐 2. Instalação do Better-Auth

```bash
npm install better-auth
```

### 1º Variáveis de Ambiente

Adicione a URL base no seu arquivo .env:

```bash
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL="postgresql://postgres:postgres@10.2.24.20:5432/login_better-auth?schema=public&search_path=public,auth"
```

## Importante: ?schema=public&search_path=public,auth é essencial para casos em que trabalhamos com mais de um schema, onde o prisma procura no public primeiro, e se não achar, procura em outro schema. Depois de alterar, se não der certo, fecha e abre o VS Code e roda um npx prisma generate

### 2º Configuração do Auth (lib/auth.ts)

Crie o arquivo com o seguinte conteúdo:

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
});
```

### 3º Criar o arquivo route.ts na pasta /app/api/auth/[...all]/route.ts com o seguinte conteúdo:

```typescript
import { auth } from "@/lib/auth"; // path to your auth file
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
```

#### 4º Criar o arquivo lib/auth-client.ts:

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,
});
```

### 3. Fluxo de Execução (Sequência Obrigatória)

Para evitar erros de sincronização entre o TypeScript e o Banco de Dados, siga esta ordem exata:

Gerar o cliente básico :

```bash
npx prisma generate
```

Cria o cliente mesmo que o schema esteja quase vazio, permitindo que o auth.ts seja lido. Caso o processo não dê certo, adicione ao schema:

```prisma
model Init {
  id Int @id @default(autoincrement())
}
```

Gerar schema do Better-Auth:

```bash
npx @better-auth/cli@latest generate
```

Responda "N" (Não) quando perguntar se deseja sobrescrever.

Aqui o schema do better-auth será gerado, e ficará no ponto para o migrate do prisma

Migrar o Banco de Dados (Cria as tabelas físicas no banco):

```bash
npx prisma migrate dev
```

Atualizar o TypeScript:

```bash
npx prisma generate
```

### 4. Implementação do better-auth

#### Ele vai usar a variável de ambiente que é link local da aplicação

## 1º Crie o arquivo proxy.ts na raiz do projeto. Ele vai ser o direcionador do projeto:

```typescript
import { NextResponse, type NextRequest } from "next/server";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/auth") || pathname.includes("_next")) {
    return NextResponse.next();
  }

  const sessionResponse = await fetch(
    `${request.nextUrl.origin}/api/auth/get-session`,
    {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    },
  );

  if (!sessionResponse.ok) {
    // Se deu erro na API, assumimos que não tem sessão para segurança
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Faz a chamada para o Better-Auth perguntando se há sessão no cookie. Se não houver, retorna null
  const session = await sessionResponse.json();

  // Seta as páginas autorizadas para usuário sem sessão
  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/usuarios/novo"); //opcional, se deseja que possa ter acesso ao cadastro

  // Se não tem sessão e tenta acessar algo protegido, redireciona para a página especificada
  if (!session?.session && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Se já tem sessão e tenta ir para login/registro de novo usuário (opcional)
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

//O Middleware só vai rodar nessas rotas. Se tentarmos acessar uma página que não está aqui (tipo uma /about), o middleware não age. No caso, se fosse matcher: ["/dashboard/:path*", "/login", "/register"], não olharia para /about
```

## 2º No formulário de login, o onSubmit(form.onHandleSubmit(onSubmit)) deve chamar a função:

```typescript
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

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
          position: "top-center",
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
```

### Utilize a linha abaixo para retornar um boolean, que serve para mudar o button, entre um disabled com spinner e texto alternativo e o button.

```typescript
const { isSubmitting } = form.formState;
{
  isSubmitting ? (
    <Button className="cursor-pointer w-full" disabled>
      <Spinner /> Cadastrando...
    </Button>
  ) : (
    <Button className="cursor-pointer w-full">Cadastrar</Button>
  );
}
```

## 3º Copiar colar o formulário de cadastro, onde a função só muda de signUp para signIn:

```typescript
async function onSubmit(values: usuarioLoginType) {
  await authClient.signIn.email(
    {
      email: values.email,
      password: values.password,
    },
    {
      onSuccess: (ctx) => {
        form.reset();
        router.push("/"); //redirecionamento opcional
      },
      onError: (ctx) => {
        toast.error(ctx.error.message, {
          position: "top-right",
        });
      },
    },
  );
}
```

## Lembrar de criar um novo type e schema para usuarioLogin

## 4º Função de logout:

```typescript
async function onClick() {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        router.push("/login");
      },
    },
  });
}
```

## 5º Pegando dados do usuário:

```typescript
const { data, isPending } = authClient.useSession();

...

  if (isPending) {
    return <>Carregando...</>;
  } else {
    return (
      <>
        <p>Bem vindo {data?.user.name}</p>
      </>
    );
  }
}
```

O isPending é a prática ideal para quando for acessar dados do objeto da sessão

## 6º Tempo de sessão e outras configurações:

### As configurações da sessão ficam por conta do lib/auth.ts, que é o typescript que cuida do backend da sessão. Neste, podemos definir o tempo da sessão em segundos:

```typescript
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 15,
  },
});
```

### Outro exemplo de configuração é algum campo adicional na tabela de usuário:

```typescript
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      cpf: {
        type: "string",
        required: false, // ou true, se for obrigatório
        input: true, // permite que o usuário envie esse dado no SignUp
      },
    },
  },
});
```

### Ou para mudar o nome das tabelas:

```typescript
user: {
  fields: {
    name: "nome";
  }
}
```

### Em resumo, este controle do esquema ocorre no auth.ts

# 7º Para o "Lembrar de mim"

### Existe um parâmetro no login (authClient.signIn) que é o rememberMe:

```typescript
async function onSubmit(values: usuarioLoginType) {
    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
        rememberMe: rememberMe, //aqui!!!
      },

```

### Este valor deve ser passado via useState, usando o componente checkBox no shadcn:

```typescript
<Checkbox
  checked={rememberMe}
  onCheckedChange={(rememberMe) => setRememberMe(!!rememberMe)}
/>
```

# 8º Integração com a google via OAuth

No Google Cloud Console
Você precisa criar as credenciais para o seu app:

```bash

1º Vá ao Google Cloud Console.

2º Crie um projeto (ou use um existente).

3º Vá em APIs e Serviços > Tela de consentimento OAuth e configure como "Externo".

4º Vá em Credenciais > Criar Credenciais > ID do cliente OAuth.

5º Em Tipo de aplicativo, escolha "Aplicativo Web".

6º Origens JavaScript autorizadas: http://localhost:3000

7º URIs de redirecionamento autorizados: http://localhost:3000/api/auth/callback/google

8º Salve o Client ID e o Client Secret no seu arquivo .env.
```

## No arquivo .env:

```bash
GOOGLE_CLIENT_ID=seu_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
```

## No auth.lib:

```typescript
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  // ... suas outras configs (session, etc)
});
```

## No frontend:

```typescript
import { authClient } from "@/lib/auth-client";

// Dentro do seu componente de Login
const handleGoogleLogin = async () => {
  await authClient.signIn.social({
    provider: "google",
    callbackURL: "/dashboard", // Para onde ele vai após logar
  });
};

// No seu JSX:
<Button
  type="button"
  variant="outline"
  onClick={handleGoogleLogin}
  className="w-full"
>
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
    {/* Ícone do Google aqui */}
  </svg>
  Entrar com Google
</Button>;
```
