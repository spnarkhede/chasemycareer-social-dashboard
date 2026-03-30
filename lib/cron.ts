// lib/cron.ts
export async function verifyCronSignature(request: Request): Promise<boolean> {
  const signature = request.headers.get("x-cron-secret");
  const expectedSignature = process.env.CRON_SECRET;

  if (!signature || !expectedSignature) {
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  if (signature.length !== expectedSignature.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }

  return result === 0;
}