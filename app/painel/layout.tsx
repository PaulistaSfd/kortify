import type { Metadata } from "next";
import { Shell } from "@/components/app/Shell";
import "./painel.css";
import { EnvScript } from "@/components/app/EnvScript";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Painel | Kortify" };

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return <><EnvScript /><Shell>{children}</Shell></>;
}
