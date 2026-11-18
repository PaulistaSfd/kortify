import { NextResponse } from "next/server";
import { supaServidor } from "@/lib/supabase/server";

// Volta do Google ou do link do e-mail: troca o código pela sessão.
export async function GET(req: Request) {
  const u = new URL(req.url);
  const code = u.searchParams.get("code");
  if (code) {
    const supa = await supaServidor();
    const { error } = await supa.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL("/painel", u.origin));
  }
  return NextResponse.redirect(new URL("/entrar?erro=link", u.origin));
}
