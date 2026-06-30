/**
 * Hex string ↔ Uint8Array conversion utilities.
 */

/**
 * Convert Uint8Array to lowercase hex string.
 */
export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Convert hex string to Uint8Array.
 */
export function fromHex(hex: string): Uint8Array {
  const str = hex.replace(/\s/g, '')
  if (str.length % 2 !== 0) {
    throw new Error(`Invalid hex string: odd length (${str.length})`)
  }
  const bytes = new Uint8Array(str.length / 2)
  for (let i = 0; i < str.length; i += 2) {
    bytes[i / 2] = parseInt(str.slice(i, i + 2), 16)
  }
  return bytes
}

