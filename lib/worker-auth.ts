// O servidor que corta as lives se identifica com WORKER_SECRET no cabeçalho.
export function workerOk(req: Request) {
  const s = process.env.WORKER_SECRET;
  return Boolean(s && req.headers.get("authorization") === `Bearer ${s}`);
}
