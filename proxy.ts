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
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

//O Middleware só vai rodar nessas rotas. Se tentarmos acessar uma página que não está aqui (tipo uma /about), o middleware não age. No caso, se fosse matcher: ["/dashboard/:path*", "/login", "/register"], não olharia para /about
