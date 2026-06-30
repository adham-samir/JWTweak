export interface KeyPairWithMeta {
  id: string
  label: string
  publicKey: CryptoKey
  privateKey: CryptoKey
  algorithm: 'RS256' | 'RS384' | 'RS512' | 'PS256' | 'PS384' | 'PS512' | 'ES256' | 'ES384' | 'ES512'
  publicKeyJwk?: JsonWebKey
  publicKeyPem?: string
  privateKeyPem?: string
  jwks?: object
  createdAt: number
}

export interface PemInfo {
  label: string
  der: ArrayBuffer
  base64body: string
}

export type HashName = 'SHA-256' | 'SHA-384' | 'SHA-512'

export interface RsaGenOptions {
  modulusLength: 2048 | 4096
  hash: HashName
}

export interface EcGenOptions {
  namedCurve: 'P-256' | 'P-384' | 'P-521'
}

export interface KidPayload {
  category: 'sqli' | 'path-traversal' | 'command-injection' | 'nosql'
  label: string
  value: string
  secretHint: string
  secretValue: string
}
