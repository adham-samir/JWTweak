/**
 * PEM parsing utilities.
 *
 * Strips PEM armor (-----BEGIN ...----- / -----END ...-----),
 * base64-decodes the body, and returns the raw DER bytes.
 *
 * Also handles key type detection from the PEM label.
 */

import type { PemInfo } from '../types/crypto.types'

const PEM_RE = /-----BEGIN (.+?)-----\s*([\s\S]*?)-----END .+?-----/

/**
 * Parse a PEM-formatted string into structured info.
 * Throws on invalid format.
 */
export function parsePEM(pem: string): PemInfo {
  const match = pem.match(PEM_RE)
  if (!match) {
    throw new Error('Invalid PEM: missing BEGIN/END armor')
  }

  const label = match[1].trim()
  const body = match[2]
    .replace(/\s/g, '') // remove all whitespace/newlines
    .trim()

  if (!body) {
    throw new Error('Invalid PEM: empty body')
  }

  // Standard base64 decode (PEM uses standard base64, not base64url)
  const binary = atob(body)
  const der = new ArrayBuffer(binary.length)
  const bytes = new Uint8Array(der)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }

  return { label, der, base64body: body }
}

/**
 * Wrap DER bytes in PEM armor.
 */
export function formatPEM(der: ArrayBuffer, label: string): string {
  const bytes = new Uint8Array(der)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  const b64 = btoa(binary)

  // Wrap at 64 characters
  const lines: string[] = []
  lines.push(`-----BEGIN ${label}-----`)
  for (let i = 0; i < b64.length; i += 64) {
    lines.push(b64.slice(i, i + 64))
  }
  lines.push(`-----END ${label}-----`)
  return lines.join('\n')
}

/**
 * Detect if PEM label indicates a public key.
 */
export function isPublicKeyLabel(label: string): boolean {
  return label.includes('PUBLIC KEY')
}

/**
 * Detect if PEM label indicates a private key.
 */
export function isPrivateKeyLabel(label: string): boolean {
  return label.includes('PRIVATE KEY')
}

/**
 * Check if a PEM label is PKCS#1 format (RSA PRIVATE KEY),
 * which Web Crypto API cannot import directly.
 */
export function isPKCS1PrivateKey(label: string): boolean {
  return label === 'RSA PRIVATE KEY'
}

/**
 * Check if a string looks like a PEM file.
 */
export function looksLikePEM(str: string): boolean {
  return /-----BEGIN /.test(str)
}

/**
 * Quick parse: get just the label from a PEM string.
 */
export function getPemLabel(pem: string): string | null {
  const match = pem.match(PEM_RE)
  return match ? match[1].trim() : null
}
