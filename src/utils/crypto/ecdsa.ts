/**
 * ECDSA signing via Web Crypto API.
 *
 * Curve mapping:
 *   ES256 → P-256
 *   ES384 → P-384
 *   ES512 → P-521 (note: NOT P-512 — the Web Crypto name is P-521)
 */

export async function ecdsaSign(
  privateKey: CryptoKey,
  data: Uint8Array,
): Promise<ArrayBuffer> {
  return crypto.subtle.sign(
    { name: 'ECDSA', hash: (privateKey.algorithm as EcdsaParams).hash },
    privateKey,
    data as BufferSource,
  )
}

export async function ecdsaVerify(
  publicKey: CryptoKey,
  signature: ArrayBuffer,
  data: Uint8Array,
): Promise<boolean> {
  return crypto.subtle.verify(
    { name: 'ECDSA', hash: (publicKey.algorithm as EcdsaParams).hash },
    publicKey,
    signature,
    data as BufferSource,
  )
}
