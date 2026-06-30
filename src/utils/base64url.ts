/**
 * Base64url encode (RFC 7515, Appendix C)
 *
 * Like standard base64 but uses '-' instead of '+', '_' instead of '/',
 * and strips trailing '=' padding — exactly how JWTs encode data.
 *
 * Matches Python: base64.urlsafe_b64encode(data).rstrip(b'=').decode()
 */

const ENC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
const DEC = new Map<string, number>()
for (let i = 0; i < ENC.length; i++) DEC.set(ENC[i], i)

/**
 * Encode Uint8Array to unpadded base64url string.
 */
export function base64urlEncode(data: Uint8Array): string {
  const len = data.length
  const rem = len % 3
  const mainLen = len - rem
  let out = ''

  // Process 3-byte chunks
  for (let i = 0; i < mainLen; i += 3) {
    const n = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2]
    out += ENC[(n >> 18) & 0x3f]
    out += ENC[(n >> 12) & 0x3f]
    out += ENC[(n >> 6) & 0x3f]
    out += ENC[n & 0x3f]
  }

  // Handle remainder
  if (rem === 2) {
    const n = (data[mainLen] << 16) | (data[mainLen + 1] << 8)
    out += ENC[(n >> 18) & 0x3f]
    out += ENC[(n >> 12) & 0x3f]
    out += ENC[(n >> 6) & 0x3f]
  } else if (rem === 1) {
    const n = data[mainLen] << 16
    out += ENC[(n >> 18) & 0x3f]
    out += ENC[(n >> 12) & 0x3f]
  }

  return out
}

/**
 * Decode base64url string to Uint8Array.
 * Automatically handles missing padding by computing from string length.
 *
 * Matches Python: base64.urlsafe_b64decode(data + '==')
 */
export function base64urlDecode(str: string): Uint8Array {
  // Remove any whitespace
  str = str.replace(/\s/g, '')

  // Calculate padding
  const rem = str.length % 4
  if (rem === 2) str += '=='
  else if (rem === 3) str += '='

  const len = str.length
  let eqCount = 0
  while (str[len - 1 - eqCount] === '=') eqCount++

  const outLen = (len * 3) / 4 - eqCount
  const out = new Uint8Array(outLen)
  let pos = 0

  for (let i = 0; i < len; i += 4) {
    const a = DEC.get(str[i]) ?? fail(str, i)
    const b = DEC.get(str[i + 1]) ?? fail(str, i + 1)
    const c = str[i + 2] === '=' ? 0 : DEC.get(str[i + 2]) ?? fail(str, i + 2)
    const d = str[i + 3] === '=' ? 0 : DEC.get(str[i + 3]) ?? fail(str, i + 3)

    out[pos++] = (a << 2) | (b >> 4)
    if (pos < outLen) out[pos++] = ((b & 0x0f) << 4) | (c >> 2)
    if (pos < outLen) out[pos++] = ((c & 0x03) << 6) | d
  }

  return out
}

function fail(str: string, i: number): never {
  throw new Error(`Invalid base64url character "${str[i]}" at position ${i}`)
}

/** Test if string looks like valid base64url. */
export function isValidBase64url(str: string): boolean {
  return /^[A-Za-z0-9\-_]*$/.test(str.replace(/\s/g, ''))
}

/**
 * Encode a JSON-serializable object as a compact (no whitespace) base64url JWT part.
 * Matches Python: json.dumps(obj, separators=(',', ':'))
 */
export function b64urlEncodeJSON(obj: unknown): string {
  const json = JSON.stringify(obj)
  const bytes = new TextEncoder().encode(json)
  return base64urlEncode(bytes)
}

/**
 * Decode a base64url JWT part and parse as JSON.
 */
export function b64urlDecodeJSON<T = Record<string, unknown>>(str: string): T {
  const bytes = base64urlDecode(str)
  const json = new TextDecoder().decode(bytes)
  return JSON.parse(json) as T
}

/**
 * Encode string to unpadded base64url.
 */
export function stringToBase64url(str: string): string {
  return base64urlEncode(new TextEncoder().encode(str))
}

/**
 * Decode base64url to string.
 */
export function base64urlToString(str: string): string {
  return new TextDecoder().decode(base64urlDecode(str))
}
