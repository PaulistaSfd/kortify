import type { Metadata } from "next";
import { Shell } from "@/components/app/Shell";
import "./painel.css";

export const metadata: Metadata = { title: "Painel | Kortify" };

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return <Shell>{children}</Shell>;
}
