// Gera os modelos de e-mail do login (Supabase → Authentication → Emails → Templates).
// Rodar: node supabase/emails/gerar.mjs  → cria magic-link.html e confirmar-cadastro.html
// E-mail não aceita CSS moderno: tudo em tabela e estilo inline de propósito.
import { writeFileSync } from "node:fs";

const SITE = "https://kortify.luisrochazz00.workers.dev";
const C = { papel: "#F1F5F9", card: "#FFFFFF", linha: "#CBD5E1", tinta: "#111827", tinta2: "#475569", tinta3: "#64748B", indigo: "#6366F1", indigoEsc: "#4F46E5" };
const DISPLAY = "'Archivo','Arial Black','Helvetica Neue',Arial,sans-serif";
const MONO = "'JetBrains Mono','SFMono-Regular',Menlo,Consolas,monospace";
const BODY = "'Helvetica Neue',Helvetica,Arial,sans-serif";

function email({ titulo, previa, rotulo, linha1, linha2, texto, botao, rodape }) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${titulo}</title>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@125,800;125,900&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<style>
  @media (max-width:600px){ .k-pad{padding-left:22px !important;padding-right:22px !important} .k-big{font-size:36px !important;line-height:34px !important} }
  a{color:${C.indigo}}
</style>
</head>
<body style="margin:0;padding:0;background:${C.papel};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${previa}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.papel};">
<tr><td align="center" style="padding:32px 12px;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:${C.card};border:1px solid ${C.linha};border-radius:18px;">
    <!-- topo -->
    <tr><td class="k-pad" style="padding:26px 36px 0 36px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="vertical-align:middle;">
          <img src="${SITE}/email/logo.png" width="28" height="28" alt="" style="display:inline-block;vertical-align:middle;border:0;">
          <span style="display:inline-block;vertical-align:middle;margin-left:8px;font-family:${DISPLAY};font-weight:900;font-size:17px;letter-spacing:-0.3px;color:${C.tinta};">KORTIFY</span>
        </td>
        <td align="right" style="vertical-align:middle;font-family:${MONO};font-size:11px;letter-spacing:0.5px;color:${C.tinta3};text-transform:uppercase;">
          <span style="color:#EF4444;">&#9679;</span>&nbsp;${rotulo}
        </td>
      </tr></table>
    </td></tr>

    <!-- título -->
    <tr><td class="k-pad" style="padding:40px 36px 0 36px;">
      <div class="k-big" style="font-family:${DISPLAY};font-weight:900;font-size:46px;line-height:42px;letter-spacing:-1.6px;text-transform:uppercase;color:${C.tinta};">${linha1}<br><span style="color:${C.indigo};">${linha2}</span></div>
      <p style="margin:22px 0 0 0;font-family:${BODY};font-size:16px;line-height:25px;color:${C.tinta2};">${texto}</p>
    </td></tr>

    <!-- botão em forma de clipe: alça | corpo | alça -->
    <tr><td class="k-pad" style="padding:30px 36px 0 36px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="background:${C.indigoEsc};border-radius:10px 0 0 10px;width:12px;padding:0;" align="center">
          <div style="width:2px;height:18px;background:#C7D2FE;border-radius:2px;margin:0 auto;"></div>
        </td>
        <td style="background:${C.indigo};">
          <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:17px 26px;font-family:${DISPLAY};font-weight:800;font-size:15px;letter-spacing:0.3px;text-transform:uppercase;color:#FFFFFF;text-decoration:none;">${botao}&nbsp;&rarr;</a>
        </td>
        <td style="background:${C.indigoEsc};border-radius:0 10px 10px 0;width:12px;padding:0;" align="center">
          <div style="width:2px;height:18px;background:#C7D2FE;border-radius:2px;margin:0 auto;"></div>
        </td>
      </tr></table>
    </td></tr>

    <!-- linha do tempo: validade do link -->
    <tr><td class="k-pad" style="padding:34px 36px 0 36px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="font-family:${MONO};font-size:11px;color:${C.tinta3};text-transform:uppercase;padding-bottom:8px;">00:00:00 · enviado</td>
          <td align="right" style="font-family:${MONO};font-size:11px;color:${C.tinta3};text-transform:uppercase;padding-bottom:8px;">01:00:00 · expira</td>
        </tr>
        <tr><td colspan="2" style="padding:0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td width="6%" style="height:8px;background:${C.indigo};border-radius:4px 0 0 4px;font-size:0;line-height:0;">&nbsp;</td>
            <td style="height:8px;background:repeating-linear-gradient(90deg,${C.linha} 0 2px,#E2E8F0 2px 10px);background-color:#E2E8F0;border-radius:0 4px 4px 0;font-size:0;line-height:0;">&nbsp;</td>
          </tr></table>
        </td></tr>
      </table>
      <p style="margin:12px 0 0 0;font-family:${BODY};font-size:13px;line-height:20px;color:${C.tinta3};">O link vale por 1 hora e funciona uma vez só.</p>
    </td></tr>

    <!-- link reserva -->
    <tr><td class="k-pad" style="padding:26px 36px 32px 36px;">
      <div style="border-top:1px dashed ${C.linha};padding-top:20px;font-family:${BODY};font-size:13px;line-height:20px;color:${C.tinta3};">
        O botão não abriu? Copia e cola no navegador:<br>
        <a href="{{ .ConfirmationURL }}" style="font-family:${MONO};font-size:11px;color:${C.indigo};word-break:break-all;">{{ .ConfirmationURL }}</a>
      </div>
    </td></tr>
  </table>

  <!-- rodapé -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
    <tr><td style="padding:20px 36px 0 36px;font-family:${BODY};font-size:12px;line-height:19px;color:${C.tinta3};">${rodape}</td></tr>
    <tr><td style="padding:14px 36px 0 36px;font-family:${MONO};font-size:10px;letter-spacing:0.5px;text-transform:uppercase;color:#94A3B8;">Kortify · cortes 9:16 da sua live</td></tr>
  </table>

</td></tr>
</table>
</body>
</html>
`;
}

const modelos = {
  "magic-link.html": email({
    titulo: "Seu link para entrar no Kortify",
    previa: "Clica e entra. Sem senha.",
    rotulo: "Link de entrada",
    linha1: "Seu link",
    linha2: "chegou.",
    texto: "Clica no botão para entrar no Kortify. Não tem senha para lembrar: este link já é a sua chave.",
    botao: "Entrar no Kortify",
    rodape: "Não pediu para entrar? Pode ignorar este e-mail. Ninguém acessa sua conta sem clicar no link.",
  }),
  "confirmar-cadastro.html": email({
    titulo: "Confirma seu e-mail no Kortify",
    previa: "Falta um clique para você começar a cortar.",
    rotulo: "Conta nova",
    linha1: "Falta",
    linha2: "um clique.",
    texto: "Confirma que este e-mail é seu e você já cai no painel. Aí é só mandar a primeira live.",
    botao: "Confirmar e entrar",
    rodape: "Não criou conta no Kortify? Pode ignorar este e-mail. Sem o clique, nada é criado.",
  }),
};

const dir = new URL(".", import.meta.url);
for (const [nome, html] of Object.entries(modelos)) writeFileSync(new URL(nome, dir), html);
console.log("ok:", Object.keys(modelos).join(", "));
