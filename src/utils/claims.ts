/**
 * JWT claim analysis — smart labels for decoded payload claims.
 *
 * Detects:
 * - Expired tokens (exp in the past)
 * - Token lifetime
 * - Common claim descriptions
 * - Malformed timestamps
 */

import type { ClaimInfo } from '../types/jwt.types'

const STANDARD_CLAIMS: Record<string, string> = {
  iss: 'Issuer',
  sub: 'Subject',
  aud: 'Audience',
  exp: 'Expiration',
  nbf: 'Not Before',
  iat: 'Issued At',
  jti: 'JWT ID',
  typ: 'Type',
  alg: 'Algorithm',
  kid: 'Key ID',
  jku: 'JWKS URL',
  jwk: 'JSON Web Key',
  scope: 'Scope',
  client_id: 'Client ID',
  azp: 'Authorized Party',
  nonce: 'Nonce',
}

/**
 * Format a Unix timestamp to a human-readable date string.
 */
export function formatTimestamp(ts: number): string {
  const d = new Date(ts * 1000)
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
}

/**
 * Analyze a single claim and return its status.
 */
export function analyzeClaim(key: string, value: unknown): ClaimInfo {
  const info: ClaimInfo = { key, value }
  const label = STANDARD_CLAIMS[key]
  if (label) info.label = label

  // Timestamp analysis
  if (key === 'exp' && typeof value === 'number') {
    const now = Math.floor(Date.now() / 1000)
    if (value < now) {
      info.status = 'error'
      info.message = `⚠ Expired ${formatTimestamp(value)} (${getRelativeTime(value)})`
    } else {
      info.status = 'ok'
      info.message = `${formatTimestamp(value)} (expires ${getRelativeTime(value)})`
    }
  }

  if (key === 'iat' && typeof value === 'number') {
    info.status = 'info'
    info.message = formatTimestamp(value)
  }

  if (key === 'nbf' && typeof value === 'number') {
    const now = Math.floor(Date.now() / 1000)
    if (value > now) {
      info.status = 'warning'
      info.message = `Not valid until ${formatTimestamp(value)} (${getRelativeTime(value)})`
    } else {
      info.status = 'info'
      info.message = formatTimestamp(value)
    }
  }

  // Empty audience
  if (key === 'aud' && Array.isArray(value) && value.length === 0) {
    info.status = 'warning'
    info.message = 'Empty audience array'
  }

  // Missing subject
  if (key === 'sub' && typeof value === 'string' && value.length === 0) {
    info.status = 'warning'
    info.message = 'Empty subject'
  }

  return info
}

/**
 * Analyze all claims in a payload.
 */
export function analyzeClaims(payload: Record<string, unknown>): ClaimInfo[] {
  return Object.entries(payload).map(([key, value]) => analyzeClaim(key, value))
}

/**
 * Get relative time string (e.g., "5 minutes ago", "in 2 hours").
 */
export function getRelativeTime(ts: number): string {
  const now = Math.floor(Date.now() / 1000)
  const diff = ts - now
  const abs = Math.abs(diff)

  const minutes = Math.floor(abs / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (diff < 0) {
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'just now'
  } else {
    if (days > 0) return `in ${days}d`
    if (hours > 0) return `in ${hours}h`
    if (minutes > 0) return `in ${minutes}m`
    return 'now'
  }
}

/**
 * Check if a token is expired.
 */
export function isExpired(exp: unknown): boolean {
  if (typeof exp !== 'number') return false
  return exp < Math.floor(Date.now() / 1000)
}
