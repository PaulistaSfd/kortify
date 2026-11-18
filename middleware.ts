import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Protege o /painel: sem login, manda para /entrar. Em modo exemplo deixa passar.
export async function middleware(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return NextResponse.next();

  let res = NextResponse.next({ request: req });
  const supa = createServerClient(url, anon, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (lista) => {
        lista.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        lista.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await supa.auth.getUser();
  const p = req.nextUrl.pathname;
  if (!user && p.startsWith("/painel")) return NextResponse.redirect(new URL("/entrar", req.url));
  if (user && p === "/entrar") return NextResponse.redirect(new URL("/painel", req.url));
  return res;
}

export const config = { matcher: ["/painel/:path*", "/entrar"] };
