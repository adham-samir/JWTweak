/**
 * HMAC signing via Web Crypto API.
 *
 * Algorithm confusion exploit: the "secret" parameter accepts raw bytes,
 * so passing the raw bytes of a PEM public key file works exactly like
 * the Python script: hmac.new(open("canada.pem","rb").read(), msg, sha256)
 *
 * Empty-key HMAC: Web Crypto API rejects zero-length HMAC keys, but
 * Python's hmac module handles them fine (useful for /dev/null path
 * traversal KID injection). We implement empty-key HMAC manually
 * using crypto.subtle.digest so the attack works in the browser too.
 */

const HASH_META: Record<string, { name: string; blockSize: number }> = {
  HS256: { name: 'SHA-256', blockSize: 64 },
  HS384: { name: 'SHA-384', blockSize: 128 },
  HS512: { name: 'SHA-512', blockSize: 128 },
}

/**
 * Compute HMAC manually for an empty key.
 *
 * HMAC(K, m) = H((K' ⊕ opad) || H((K' ⊕ ipad) || m))
 * When K is empty: K' is a block of zeros,
 *   so K' ⊕ ipad = block of 0x36, K' ⊕ opad = block of 0x5c
 */
async function hmacEmptyKey(hashName: string, blockSize: number, data: Uint8Array): Promise<ArrayBuffer> {
  const ipad = new Uint8Array(blockSize)
  const opad = new Uint8Array(blockSize)
  ipad.fill(0x36)
  opad.fill(0x5c)

  // inner = H(ipad || message)
  const innerInput = new Uint8Array(blockSize + data.length)
  innerInput.set(ipad)
  innerInput.set(data, blockSize)
  const innerHash = await crypto.subtle.digest(hashName, innerInput)

  // outer = H(opad || inner)
  const outerInput = new Uint8Array(blockSize + innerHash.byteLength)
  outerInput.set(opad)
  outerInput.set(new Uint8Array(innerHash), blockSize)
  return crypto.subtle.digest(hashName, outerInput)
}

/**
 * Sign data with HMAC using raw secret bytes.
 *
 * @param algorithm - 'HS256' | 'HS384' | 'HS512'
 * @param secret - Raw key bytes (empty = /dev/null path traversal scenario)
 * @param data - Message to sign
 * @returns Signature bytes
 */
export async function hmacSign(
  algorithm: 'HS256' | 'HS384' | 'HS512',
  secret: Uint8Array,
  data: Uint8Array,
): Promise<ArrayBuffer> {
  const meta = HASH_META[algorithm]

  // Web Crypto rejects empty HMAC keys. Fall back to manual implementation.
  if (secret.length === 0) {
    return hmacEmptyKey(meta.name, meta.blockSize, data)
  }

  const key = await crypto.subtle.importKey(
    'raw',
    secret as BufferSource,
    { name: 'HMAC', hash: meta.name },
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
  const meta = HASH_META[algorithm]

  if (secret.length === 0) {
    const expected = await hmacEmptyKey(meta.name, meta.blockSize, data)
    // Constant-time-ish comparison
    const a = new Uint8Array(expected)
    const b = new Uint8Array(signature)
    if (a.length !== b.length) return false
    return a.every((v, i) => v === b[i])
  }

  const key = await crypto.subtle.importKey(
    'raw',
    secret as BufferSource,
    { name: 'HMAC', hash: meta.name },
    false,
    ['verify'],
  )

  return crypto.subtle.verify('HMAC', key, signature, data as BufferSource)
}
