/**
 * JWT encode — build the unsigned portion of a JWT.
 *
 * Takes header and payload objects, serializes them as compact JSON,
 * base64url-encodes them, and returns the message ready for signing.
 *
 * Matches Python:
 *   json.dumps(header, separators=(',', ':'))
 *   base64.urlsafe_b64encode(header_json).rstrip(b'=').decode()
 */

import { b64urlEncodeJSON } from '../base64url'

export interface UnsignedJWT {
  headerB64: string
  payloadB64: string
  /** The message to sign: headerB64 + '.' + payloadB64 */
  message: Uint8Array
}

/**
 * Build the unsigned portion of a JWT.
 *
 * Encodes header and payload as compact JSON (no whitespace),
 * then base64url-encodes them without padding.
 * Returns the two encoded parts plus the signing message.
 */
export function buildUnsignedJWT(
  header: Record<string, unknown>,
  payload: Record<string, unknown>,
): UnsignedJWT {
  const headerB64 = b64urlEncodeJSON(header)
  const payloadB64 = b64urlEncodeJSON(payload)
  const messageStr = `${headerB64}.${payloadB64}`
  const message = new TextEncoder().encode(messageStr)

  return { headerB64, payloadB64, message }
}
