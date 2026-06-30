/**
 * JWK utilities — CryptoKey ↔ JWK ↔ PEM conversions,
 * bigint ↔ base64url conversion for RSA n/e parameters.
 */

import { base64urlEncode, base64urlDecode } from '../base64url'
import { exportKeyJWK, importPublicKeyJWK, importPrivateKeyJWK } from './keygen'
import { parsePEM } from '../pem'

// ─── BigInt ↔ Base64url ───────────────────────────────────────

/**
 * Convert a BigInt to base64url string.
 * Used for RSA n and e parameters in JWK format.
 *
 * Matches Python:
 *   byte_length = (n.bit_length() + 7) // 8
 *   n_bytes = n.to_bytes(byte_length, 'big')
 *   return base64.urlsafe_b64encode(n_bytes).rstrip(b'=').decode()
 */
export function bigIntToBase64url(n: bigint): string {
  if (n === 0n) return 'AA' // 0 encoded as single byte 0x00

  const hex = n.toString(16)
  const hexLen = hex.length
  const byteLen = (hexLen + 1) >> 1

  const bytes = new Uint8Array(byteLen)
  for (let i = 0; i < byteLen; i++) {
    const start = Math.max(0, hexLen - (i + 1) * 2)
    const end = hexLen - i * 2
    const chunk = hex.slice(start, end)
    bytes[byteLen - 1 - i] = parseInt(chunk.padStart(2, '0'), 16)
  }

  return base64urlEncode(bytes)
}

/**
 * Convert a base64url string to BigInt.
 * Used to parse RSA n and e parameters from JWK format.
 */
export function base64urlToBigInt(str: string): bigint {
  const bytes = base64urlDecode(str)
  let hex = ''
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0')
  }
  return hex ? BigInt('0x' + hex) : 0n
}

// ─── CryptoKey ↔ JWK ──────────────────────────────────────────

export async function cryptoKeyToJWK(key: CryptoKey): Promise<JsonWebKey> {
  return exportKeyJWK(key)
}

export async function jwkToPublicCryptoKey(
  jwk: JsonWebKey,
  algorithm?: RsaHashedImportParams | EcKeyImportParams,
): Promise<CryptoKey> {
  const alg = algorithm || inferAlgorithm(jwk)
  return importPublicKeyJWK(jwk, alg)
}

export async function jwkToPrivateCryptoKey(
  jwk: JsonWebKey,
  algorithm?: RsaHashedImportParams | EcKeyImportParams,
): Promise<CryptoKey> {
  const alg = algorithm || inferAlgorithm(jwk)
  return importPrivateKeyJWK(jwk, alg)
}

// ─── PEM → JWK ────────────────────────────────────────────────

/**
 * Convert a PEM public key to JWK.
 */
export async function pemToJWK(pem: string): Promise<JsonWebKey> {
  const { label, der } = parsePEM(pem)

  const isPublic = label.includes('PUBLIC KEY')

  const format: 'spki' | 'pkcs8' = isPublic ? 'spki' : 'pkcs8'
  // We need to infer import params. For simplicity, try common RSA params.
  const key = await crypto.subtle.importKey(
    format,
    der,
    isPublic
      ? { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }
      : { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    true,
    isPublic ? ['verify'] : ['sign'],
  )

  return exportKeyJWK(key)
}

// ─── Helpers ───────────────────────────────────────────────────

/**
 * Try to infer Web Crypto import params from a JWK.
 */
function inferAlgorithm(jwk: JsonWebKey): RsaHashedImportParams | EcKeyImportParams {
  if (jwk.kty === 'RSA') {
    return { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }
  }
  if (jwk.kty === 'EC') {
    const curve = jwk.crv || 'P-256'
    return { name: 'ECDSA', namedCurve: curve }
  }
  throw new Error(`Unknown JWK key type: ${jwk.kty}`)
}

/**
 * Build a JWKS (JSON Web Key Set) document from an array of JWKs.
 */
export function buildJWKS(jwks: JsonWebKey[], kid?: string): object {
  return {
    keys: jwks.map((jwk, i) => ({
      ...jwk,
      ...(kid !== undefined ? { kid: `${kid}-${i}` } : {}),
    })),
  }
}
