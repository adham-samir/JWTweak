/**
 * Key generation, import, and export via Web Crypto API.
 *
 * Supports RSA and EC keypairs. All operations return CryptoKey objects
 * that can be used directly with the sign/verify functions.
 */

import { parsePEM, formatPEM, isPKCS1PrivateKey } from '../pem'
import type { RsaGenOptions, EcGenOptions } from '../../types/crypto.types'

// ─── RSA Key Generation ───────────────────────────────────────

export async function generateRSAKeypair(
  options: RsaGenOptions = { modulusLength: 2048, hash: 'SHA-256' },
): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: options.modulusLength,
      publicExponent: new Uint8Array([1, 0, 1]), // 65537
      hash: options.hash,
    },
    true, // extractable — needed for JWK/PEM export
    ['sign', 'verify'],
  )
}

export async function generateRSAPSSKeypair(
  options: RsaGenOptions = { modulusLength: 2048, hash: 'SHA-256' },
): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    {
      name: 'RSA-PSS',
      modulusLength: options.modulusLength,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: options.hash,
    },
    true,
    ['sign', 'verify'],
  )
}

// ─── EC Key Generation ────────────────────────────────────────

export async function generateECKeypair(
  options: EcGenOptions = { namedCurve: 'P-256' },
): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve: options.namedCurve,
    },
    true,
    ['sign', 'verify'],
  )
}

// ─── Key Import ────────────────────────────────────────────────

/**
 * Import a public key from SPKI (DER) format.
 * This is the DER body of a PEM public key.
 */
export async function importPublicKeySpki(
  spki: ArrayBuffer,
  algorithm: RsaHashedImportParams | EcKeyImportParams,
): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'spki',
    spki,
    algorithm,
    true,
    ['verify'],
  )
}

/**
 * Import a private key from PKCS8 (DER) format.
 */
export async function importPrivateKeyPkcs8(
  pkcs8: ArrayBuffer,
  algorithm: RsaHashedImportParams | EcKeyImportParams,
): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'pkcs8',
    pkcs8,
    algorithm,
    true,
    ['sign'],
  )
}

/**
 * Import a public key from PEM string.
 * Handles SPKI format (-----BEGIN PUBLIC KEY----- / -----BEGIN RSA PUBLIC KEY-----).
 * Throws if the PEM label is not a public key.
 */
export async function importPublicKeyPEM(
  pem: string,
  algorithm: RsaHashedImportParams | EcKeyImportParams,
): Promise<CryptoKey> {
  const { label, der } = parsePEM(pem)

  if (!label.includes('PUBLIC KEY')) {
    throw new Error(`Expected a PUBLIC KEY PEM, got "${label}"`)
  }

  return importPublicKeySpki(der, algorithm)
}

/**
 * Import a private key from PEM string.
 * Only PKCS#8 format (-----BEGIN PRIVATE KEY-----) is supported by Web Crypto.
 * PKCS#1 format (-----BEGIN RSA PRIVATE KEY-----) will be rejected with
 * a clear error message pointing to the OpenSSL conversion command.
 */
export async function importPrivateKeyPEM(
  pem: string,
  algorithm: RsaHashedImportParams | EcKeyImportParams,
): Promise<CryptoKey> {
  const { label, der } = parsePEM(pem)

  if (isPKCS1PrivateKey(label)) {
    throw new Error(
      'PKCS#1 RSA private keys are not supported by Web Crypto API.\n' +
      'Convert it to PKCS#8 first:\n' +
      '  openssl pkcs8 -topk8 -inform PEM -in key.pem -out key.pk8 -nocrypt\n' +
      'Then upload the resulting PKCS#8 key.'
    )
  }

  if (!label.includes('PRIVATE KEY')) {
    throw new Error(`Expected a PRIVATE KEY PEM, got "${label}"`)
  }

  return importPrivateKeyPkcs8(der, algorithm)
}

/**
 * Import a public key from JWK.
 */
export async function importPublicKeyJWK(
  jwk: JsonWebKey,
  algorithm: RsaHashedImportParams | EcKeyImportParams,
): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    algorithm,
    true,
    ['verify'],
  )
}

/**
 * Import a private key from JWK.
 */
export async function importPrivateKeyJWK(
  jwk: JsonWebKey,
  algorithm: RsaHashedImportParams | EcKeyImportParams,
): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    algorithm,
    true,
    ['sign'],
  )
}

// ─── Key Export ────────────────────────────────────────────────

/**
 * Export a public key as SPKI DER (for PEM wrapping).
 */
export async function exportPublicKeySpki(key: CryptoKey): Promise<ArrayBuffer> {
  return crypto.subtle.exportKey('spki', key)
}

/**
 * Export a private key as PKCS8 DER (for PEM wrapping).
 */
export async function exportPrivateKeyPkcs8(key: CryptoKey): Promise<ArrayBuffer> {
  return crypto.subtle.exportKey('pkcs8', key)
}

/**
 * Export a public key as PEM string.
 */
export async function exportPublicKeyPEM(key: CryptoKey): Promise<string> {
  const spki = await exportPublicKeySpki(key)
  return formatPEM(spki, 'PUBLIC KEY')
}

/**
 * Export a private key as PEM string.
 */
export async function exportPrivateKeyPEM(key: CryptoKey): Promise<string> {
  const pkcs8 = await exportPrivateKeyPkcs8(key)
  return formatPEM(pkcs8, 'PRIVATE KEY')
}

/**
 * Export a key as JWK.
 */
export async function exportKeyJWK(key: CryptoKey): Promise<JsonWebKey> {
  return crypto.subtle.exportKey('jwk', key)
}

// ─── Helpers ───────────────────────────────────────────────────

/**
 * Build Web Crypto import params for RSA algorithms.
 */
export function rsaImportParams(hash: string): RsaHashedImportParams {
  return { name: 'RSASSA-PKCS1-v1_5', hash }
}

export function rsaPssImportParams(hash: string): RsaHashedImportParams {
  return { name: 'RSA-PSS', hash }
}

/**
 * Build Web Crypto import params for EC algorithms.
 */
export function ecImportParams(namedCurve: string): EcKeyImportParams {
  return { name: 'ECDSA', namedCurve }
}
