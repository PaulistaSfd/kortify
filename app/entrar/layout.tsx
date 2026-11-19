import type { Metadata } from "next";
import { EnvScript } from "@/components/app/EnvScript";

export const metadata: Metadata = { title: "Entrar | Kortify" };
export const dynamic = "force-dynamic";

export default function EntrarLayout({ children }: { children: React.ReactNode }) {
  return <><EnvScript />{children}</>;
}
