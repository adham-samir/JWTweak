/**
 * RSA signing via Web Crypto API (RSASSA-PKCS1-v1_5).
 *
 * Important: the hash is baked into the CryptoKey at import/generation time,
 * NOT passed at sign time. This is different from Python's cryptography
 * library where you pass the hash to the sign() call.
 */

export async function rsaSign(
  privateKey: CryptoKey,
  data: Uint8Array,
): Promise<ArrayBuffer> {
  return crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    privateKey,
    data as BufferSource,
  )
}

export async function rsaVerify(
  publicKey: CryptoKey,
  signature: ArrayBuffer,
  data: Uint8Array,
): Promise<boolean> {
  return crypto.subtle.verify(
    { name: 'RSASSA-PKCS1-v1_5' },
    publicKey,
    signature,
    data as BufferSource,
  )
}
