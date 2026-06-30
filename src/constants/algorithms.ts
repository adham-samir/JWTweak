import type { JwtAlgorithm } from '../types/jwt.types'
import type { HashName } from '../types/crypto.types'

export const ALGORITHMS: { value: JwtAlgorithm; label: string; category: string }[] = [
  { value: 'none', label: 'none (no signature)', category: 'None' },
  { value: 'HS256', label: 'HS256 (HMAC-SHA256)', category: 'HMAC' },
  { value: 'HS384', label: 'HS384 (HMAC-SHA384)', category: 'HMAC' },
  { value: 'HS512', label: 'HS512 (HMAC-SHA512)', category: 'HMAC' },
  { value: 'RS256', label: 'RS256 (RSA-PKCS1v15+SHA256)', category: 'RSA' },
  { value: 'RS384', label: 'RS384 (RSA-PKCS1v15+SHA384)', category: 'RSA' },
  { value: 'RS512', label: 'RS512 (RSA-PKCS1v15+SHA512)', category: 'RSA' },
  { value: 'PS256', label: 'PS256 (RSA-PSS+SHA256)', category: 'RSA-PSS' },
  { value: 'PS384', label: 'PS384 (RSA-PSS+SHA384)', category: 'RSA-PSS' },
  { value: 'PS512', label: 'PS512 (RSA-PSS+SHA512)', category: 'RSA-PSS' },
  { value: 'ES256', label: 'ES256 (ECDSA P-256+SHA256)', category: 'ECDSA' },
  { value: 'ES384', label: 'ES384 (ECDSA P-384+SHA384)', category: 'ECDSA' },
  { value: 'ES512', label: 'ES512 (ECDSA P-521+SHA512)', category: 'ECDSA' },
]

export const ALGORITHM_TO_HASH: Record<JwtAlgorithm, HashName | null> = {
  none: null,
  HS256: 'SHA-256', RS256: 'SHA-256', PS256: 'SHA-256', ES256: 'SHA-256',
  HS384: 'SHA-384', RS384: 'SHA-384', PS384: 'SHA-384', ES384: 'SHA-384',
  HS512: 'SHA-512', RS512: 'SHA-512', PS512: 'SHA-512', ES512: 'SHA-512',
}

export const HMAC_ALGORITHMS: JwtAlgorithm[] = ['HS256', 'HS384', 'HS512']
export const RSA_ALGORITHMS: JwtAlgorithm[] = ['RS256', 'RS384', 'RS512']
export const RSA_PSS_ALGORITHMS: JwtAlgorithm[] = ['PS256', 'PS384', 'PS512']
export const ECDSA_ALGORITHMS: JwtAlgorithm[] = ['ES256', 'ES384', 'ES512']

export function isHmac(alg: JwtAlgorithm): boolean {
  return HMAC_ALGORITHMS.includes(alg)
}

export function isRsa(alg: JwtAlgorithm): boolean {
  return RSA_ALGORITHMS.includes(alg)
}

export function isRsaPss(alg: JwtAlgorithm): boolean {
  return RSA_PSS_ALGORITHMS.includes(alg)
}

export function isEcdsa(alg: JwtAlgorithm): boolean {
  return ECDSA_ALGORITHMS.includes(alg)
}

export function isSymmetric(alg: JwtAlgorithm): boolean {
  return alg === 'none' || isHmac(alg)
}
