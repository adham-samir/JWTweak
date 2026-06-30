export type TabId =
  | 'home'
  | 'decoder'
  | 'encoder'
  | 'attacks'
  | 'key-tools'

export type AttackSubTab =
  | 'alg-confusion'
  | 'kid-injection'
  | 'jku-injection'
  | 'jwk-embedding'

export type JwtAlgorithm =
  | 'none'
  | 'HS256' | 'HS384' | 'HS512'
  | 'RS256' | 'RS384' | 'RS512'
  | 'PS256' | 'PS384' | 'PS512'
  | 'ES256' | 'ES384' | 'ES512'

export type ClaimStatus = 'ok' | 'warning' | 'error' | 'info'

export interface ClaimInfo {
  key: string
  value: unknown
  label?: string
  status?: ClaimStatus
  message?: string
}

export interface DecodedPart {
  raw: string          // base64url encoded
  json: Record<string, unknown>
}

export interface DecodedJWT {
  header: DecodedPart
  payload: DecodedPart
  signature: {
    raw: string        // base64url encoded
    bytes: Uint8Array
  }
  parts: {
    headerB64: string
    payloadB64: string
    signatureB64: string
    full: string
  }
}

export interface Tab {
  id: TabId
  label: string
  icon: string
}
