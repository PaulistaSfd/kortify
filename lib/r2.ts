import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { lerEnv } from "./supabase/config";

// Cloudflare R2 (compatível com S3). Guarda as lives e os cortes prontos.
// As chaves são lidas na hora, das variáveis do Worker.
const bucket = () => lerEnv("R2_BUCKET") || "kortify";
export const r2Ligado = () => Boolean(lerEnv("R2_ACCOUNT_ID") && lerEnv("R2_ACCESS_KEY_ID") && lerEnv("R2_SECRET_ACCESS_KEY"));

let s3: S3Client | null = null;
function cliente() {
  if (!s3) s3 = new S3Client({
    region: "auto",
    endpoint: `https://${lerEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: lerEnv("R2_ACCESS_KEY_ID"), secretAccessKey: lerEnv("R2_SECRET_ACCESS_KEY") },
  });
  return s3;
}

// Link temporário para o navegador mandar o arquivo direto para o R2 (não passa pelo servidor)
export const linkEnvio = (key: string, tipo: string) =>
  getSignedUrl(cliente(), new PutObjectCommand({ Bucket: bucket(), Key: key, ContentType: tipo }), { expiresIn: 3600 });

// Link temporário para baixar
export const linkDownload = (key: string, nome?: string) =>
  getSignedUrl(cliente(), new GetObjectCommand({ Bucket: bucket(), Key: key, ResponseContentDisposition: nome ? `attachment; filename="${nome}"` : undefined }), { expiresIn: 3600 });
