/**
 * HMAC signing via Web Crypto API.
 *
 * Algorithm confusion exploit: the "secret" parameter accepts raw bytes,
 * so passing the raw bytes of a PEM public key file works exactly like
 * the Python script: hmac.new(open("canada.pem","rb").read(), msg, sha256)
 */

const HASH_MAP: Record<string, string> = {
  HS256: 'SHA-256',
  HS384: 'SHA-384',
  HS512: 'SHA-512',
}

/**
 * Sign data with HMAC using raw secret bytes.
 *
 * @param algorithm - 'HS256' | 'HS384' | 'HS512'
 * @param secret - Raw key bytes (can be anything — PEM file, string, etc.)
 * @param data - Message to sign
 * @returns Signature bytes
 */
export async function hmacSign(
  algorithm: 'HS256' | 'HS384' | 'HS512',
  secret: Uint8Array,
  data: Uint8Array,
): Promise<ArrayBuffer> {
  const hash = HASH_MAP[algorithm]

  const key = await crypto.subtle.importKey(
    'raw',
    secret as BufferSource,
    { name: 'HMAC', hash },
    false,
    ['sign'],
  )

  return crypto.subtle.sign('HMAC', key, data as BufferSource)
}

/**
 * Verify HMAC signature.
 */
export async function hmacVerify(
  algorithm: 'HS256' | 'HS384' | 'HS512',
  secret: Uint8Array,
  signature: ArrayBuffer,
  data: Uint8Array,
): Promise<boolean> {
  const hash = HASH_MAP[algorithm]

  const key = await crypto.subtle.importKey(
    'raw',
    secret as BufferSource,
    { name: 'HMAC', hash },
    false,
    ['verify'],
  )

  return crypto.subtle.verify('HMAC', key, signature, data as BufferSource)
}
