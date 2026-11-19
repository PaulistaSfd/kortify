"use client";
import { createBrowserClient } from "@supabase/ssr";
import { supaEnv } from "./config";

let cliente: ReturnType<typeof createBrowserClient> | null = null;
export function supaNavegador() {
  if (!cliente) { const e = supaEnv(); cliente = createBrowserClient(e.url, e.anon); }
  return cliente;
}
