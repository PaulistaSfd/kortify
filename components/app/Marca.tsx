import { useId } from "react";

// Logo do Kortify: clipe vertical 9:16 fatiado na diagonal, com o play embaixo.
export function Marca({ size = 28 }: { size?: number }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className="logo-mark" viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <defs>
        <clipPath id={`b${id}`}><path d="M0 32V24.4L32 11.6V32Z" /></clipPath>
        <clipPath id={`t${id}`}><path d="M0 0H32V8.4L0 21.2Z" /></clipPath>
      </defs>
      <g clipPath={`url(#b${id})`}><rect x="8" y="2.5" width="16" height="27" rx="4.5" className="lm-b" /></g>
      <g clipPath={`url(#t${id})`} transform="translate(1.6 -1.2)"><rect x="8" y="2.5" width="16" height="27" rx="4.5" className="lm-t" /></g>
      <path d="M14.2 20.6 19.6 23.6 14.2 26.6Z" className="lm-p" />
    </svg>
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <a href={href} className="logo" aria-label="Kortify, início">
      <Marca /><span className="logo-word">kortify</span>
    </a>
  );
}
