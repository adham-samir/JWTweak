/**
 * JWT decode — pure synchronous function, no crypto.
 *
 * Splits on '.', base64url-decodes each part, JSON-parses header and payload.
 * Handles 2-part tokens (alg=none) and 3-part tokens.
 */

import { base64urlDecode, b64urlDecodeJSON, isValidBase64url } from '../base64url'
import type { DecodedJWT } from '../../types/jwt.types'

export class JWTDecodeError extends Error {
  public readonly code: string

  constructor(message: string, code: string) {
    super(message)
    this.name = 'JWTDecodeError'
    this.code = code
  }
}

/**
 * Validate that a string looks like a JWT before attempting decode.
 */
export function validateTokenFormat(token: string): boolean {
  if (!token || typeof token !== 'string') return false
  const parts = token.trim().split('.')
  if (parts.length < 2 || parts.length > 3) return false
  return parts.every(p => isValidBase64url(p))
}

/**
 * Decode a JWT token into its structured parts.
 *
 * @throws {JWTDecodeError} on invalid format, base64url, or JSON
 */
export function decodeJWT(token: string): DecodedJWT {
  const trimmed = token.trim()

  if (!trimmed) {
    throw new JWTDecodeError('Token is empty', 'EMPTY_TOKEN')
  }

  const parts = trimmed.split('.')

  if (parts.length < 2) {
    throw new JWTDecodeError(
      'Not a JWT: expected at least 2 parts separated by "." (got ' + parts.length + ')',
      'NOT_ENOUGH_PARTS',
    )
  }

  if (parts.length > 3) {
    throw new JWTDecodeError(
      'Not a JWT: expected 2 or 3 parts separated by "." (got ' + parts.length + ')',
      'TOO_MANY_PARTS',
    )
  }

  const [headerB64, payloadB64, signatureB64 = ''] = parts

  // Validate base64url characters
  for (const { part, name } of [
    { part: headerB64, name: 'Header' },
    { part: payloadB64, name: 'Payload' },
    ...(signatureB64 ? [{ part: signatureB64, name: 'Signature' }] : []),
  ]) {
    if (!isValidBase64url(part)) {
      throw new JWTDecodeError(
        `${name} contains invalid base64url characters`,
        'INVALID_BASE64URL',
      )
    }
  }

  // Decode header
  let headerJson: Record<string, unknown>
  try {
    headerJson = b64urlDecodeJSON(headerB64)
  } catch (e) {
    throw new JWTDecodeError(
      `Failed to parse header JSON: ${(e as Error).message}`,
      'HEADER_JSON_ERROR',
    )
  }

  // Decode payload
  let payloadJson: Record<string, unknown>
  try {
    payloadJson = b64urlDecodeJSON(payloadB64)
  } catch (e) {
    throw new JWTDecodeError(
      `Failed to parse payload JSON: ${(e as Error).message}`,
      'PAYLOAD_JSON_ERROR',
    )
  }

  // Decode signature bytes
  let sigBytes: Uint8Array
  try {
    sigBytes = signatureB64 ? base64urlDecode(signatureB64) : new Uint8Array(0)
  } catch {
    sigBytes = new Uint8Array(0)
  }

  return {
    header: {
      raw: headerB64,
      json: headerJson,
    },
    payload: {
      raw: payloadB64,
      json: payloadJson,
    },
    signature: {
      raw: signatureB64,
      bytes: sigBytes,
    },
    parts: {
      headerB64,
      payloadB64,
      signatureB64,
      full: trimmed,
    },
  }
}

/**
 * Safely decode a JWT, returning null on any error instead of throwing.
 */
export function safeDecodeJWT(token: string): DecodedJWT | null {
  try {
    return decodeJWT(token)
  } catch {
    return null
  }
}
