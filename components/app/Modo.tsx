"use client";
import { Sun, Moon } from "../icons";

// Alterna claro e escuro (paleta azul) e guarda a escolha.
export function Modo() {
  const trocar = () => {
    const d = document.documentElement;
    const novo = d.getAttribute("data-palette") === "azul" ? "claro" : "azul";
    d.setAttribute("data-palette", novo);
    try { localStorage.setItem("kortify-modo", novo); } catch (e) {}
  };
  return (
    <button type="button" className="mode" onClick={trocar} aria-label="Alternar modo claro e escuro">
      <Sun className="mode-sun" width={18} height={18} />
      <Moon className="mode-moon" width={18} height={18} />
    </button>
  );
}
