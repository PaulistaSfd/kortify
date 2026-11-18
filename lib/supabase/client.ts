"use client";
import { createBrowserClient } from "@supabase/ssr";
import { SUPA_URL, SUPA_ANON } from "./config";

let cliente: ReturnType<typeof createBrowserClient> | null = null;
export function supaNavegador() {
  if (!cliente) cliente = createBrowserClient(SUPA_URL, SUPA_ANON);
  return cliente;
}
