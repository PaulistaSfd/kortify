import Link from "next/link";
import type { ReactNode, MouseEventHandler } from "react";

// Botão em forma de clipe da timeline, o mesmo do site.
type Props = {
  children: string;
  href?: string;
  v?: "yellow" | "ink" | "line";
  size?: "" | "btn-sm" | "btn-lg";
  icon?: ReactNode;
  onClick?: MouseEventHandler;
  type?: "button" | "submit";
  disabled?: boolean;
  full?: boolean;
};

export function Botao({ children, href, v = "yellow", size = "btn-sm", icon, onClick, type = "button", disabled, full }: Props) {
  const cls = `btn btn-${v} ${size}${full ? " btn-full" : ""}`;
  const dentro = (
    <>
      <span className="btn-handle l" aria-hidden="true" />
      {icon}
      <span className="btn-roll" data-text={children}><span>{children}</span></span>
      <span className="btn-handle r" aria-hidden="true" />
    </>
  );
  if (href) return <Link href={href} className={cls} onClick={onClick}>{dentro}</Link>;
  return <button type={type} className={cls} onClick={onClick} disabled={disabled}>{dentro}</button>;
}
