/**
 * JWT sign — orchestrator that routes algorithm to the correct signer.
 *
 * This is the central signing function used by all attack panels.
 * It builds the unsigned JWT, signs with the appropriate algorithm,
 * and returns the complete token.
 */

import { buildUnsignedJWT } from './encode'
import { base64urlEncode } from '../base64url'
import { hmacSign } from '../crypto/hmac'
import { rsaSign } from '../crypto/rsa'
import { ecdsaSign } from '../crypto/ecdsa'
import type { JwtAlgorithm } from '../../types/jwt.types'

export interface SignOptions {
  algorithm: JwtAlgorithm
  /** For HMAC: raw secret bytes. For RSA/EC: CryptoKey */
  key?: CryptoKey | Uint8Array | null
}

export class JWTSignError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'JWTSignError'
  }
}

/**
 * Sign a JWT with the given algorithm and key.
 *
 * @returns Complete JWT string (header.payload.signature)
 */
export async function signJWT(
  header: Record<string, unknown>,
  payload: Record<string, unknown>,
  options: SignOptions,
): Promise<string> {
  const { algorithm, key } = options

  const { headerB64, payloadB64, message } = buildUnsignedJWT(header, payload)

  let signatureBytes: ArrayBuffer

  switch (algorithm) {
    case 'none':
      // No signature — just return empty
      return `${headerB64}.${payloadB64}.`

    case 'HS256':
    case 'HS384':
    case 'HS512':
      if (!key) throw new JWTSignError('HMAC signing requires a secret key')
      if (!(key instanceof Uint8Array)) throw new JWTSignError('HMAC signing requires raw bytes (Uint8Array), got CryptoKey')
      signatureBytes = await hmacSign(algorithm, key, message)
      break

    case 'RS256':
    case 'RS384':
    case 'RS512':
      if (!key) throw new JWTSignError('RSA signing requires a private key')
      if (key instanceof Uint8Array) throw new JWTSignError('RSA signing requires a CryptoKey, got raw bytes')
      signatureBytes = await rsaSign(key, message)
      break

    case 'PS256':
    case 'PS384':
    case 'PS512':
      if (!key) throw new JWTSignError('RSA-PSS signing requires a private key')
      if (key instanceof Uint8Array) throw new JWTSignError('RSA-PSS signing requires a CryptoKey, got raw bytes')
      // For PSS, import with PSS params
      signatureBytes = await crypto.subtle.sign(
        { name: 'RSA-PSS', saltLength: 32 },
        key,
        message as BufferSource,
      )
      break

    case 'ES256':
    case 'ES384':
    case 'ES512':
      if (!key) throw new JWTSignError('ECDSA signing requires a private key')
      if (key instanceof Uint8Array) throw new JWTSignError('ECDSA signing requires a CryptoKey, got raw bytes')
      signatureBytes = await ecdsaSign(key, message)
      break

    default:
      throw new JWTSignError(`Unsupported algorithm: ${algorithm}`)
  }

  const sigB64 = base64urlEncode(new Uint8Array(signatureBytes))

  return `${headerB64}.${payloadB64}.${sigB64}`
}
