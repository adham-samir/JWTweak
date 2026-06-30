export interface SampleToken {
  label: string
  description: string
  token: string
  algorithm: string
}

export const SAMPLE_TOKENS: SampleToken[] = [
  {
    label: 'HS256 (simple)',
    description: 'Simple HMAC-SHA256 token with "admin" subject',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsIm5hbWUiOiJUZXN0IFVzZXIiLCJpYXQiOjE3ODI4MTczMzksImV4cCI6MjU1NjIzOTczOX0.2g0wM7xY5sD7Bq8Kp3vRfLmNtZwQhJkVcXbFdEaYu_I',
    algorithm: 'HS256',
  },
  {
    label: 'RS256 (expired)',
    description: 'RSA-signed JWT — already expired',
    token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0ZXIiLCJpYXQiOjE3ODI4MTczMzksImV4cCI6MTc4MjgyMDk0MCwibmFtZSI6IkV4cGlyZWQgVG9rZW4ifQ.fake-signature',
    algorithm: 'RS256',
  },
  {
    label: 'none (no signature)',
    description: 'Token with alg=none — should never be accepted by well-configured servers',
    token: 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhbm9ueW1vdXMiLCJpYXQiOjE3ODI4MTczMzl9.',
    algorithm: 'none',
  },
]
