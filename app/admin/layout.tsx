import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { acessoAdmin } from "@/lib/admin/acesso";
import { carregarAdmin } from "@/lib/admin/carregar";
import "../painel/painel.css";
import "./admin.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin | Kortify", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const acesso = await acessoAdmin();
  if (acesso.estado === "nao") {
    if (!acesso.email) redirect("/entrar");
    notFound();
  }
  const dados = await carregarAdmin(acesso.estado);
  return <AdminShell dados={dados} quem={acesso.nome || "Modo exemplo"}>{children}</AdminShell>;
}
