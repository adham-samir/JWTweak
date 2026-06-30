export interface SampleToken {
  label: string
  description: string
  token: string
  algorithm: string
}

export const SAMPLE_TOKENS: SampleToken[] = [
  {
    label: 'HS256 (valid)',
    description: 'HMAC-SHA256 signed with secret "secret" — verify it in the signature section',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsIm5hbWUiOiJUZXN0IFVzZXIiLCJpYXQiOjE3ODI4MTczMzksImV4cCI6MjU1NjIzOTczOX0.NMo-BMgxMzMYca41QTLor7vfyJM44LLMisQmgwp1t-U',
    algorithm: 'HS256',
  },
  {
    label: 'HS256 (expired)',
    description: 'HMAC-SHA256 token — already expired, see the ⚠ claim label',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0ZXIiLCJpYXQiOjE3ODI4MTczMzksImV4cCI6MTc4MjgyMDk0MCwibmFtZSI6IkV4cGlyZWQgVG9rZW4ifQ.iu0GcUevjBqB-TFQ8AXSYKgWMpZPu-Z-6QCkHRgV2UE',
    algorithm: 'HS256',
  },
  {
    label: 'none (no signature)',
    description: 'Token with alg=none — should never be accepted by well-configured servers',
    token: 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhbm9ueW1vdXMiLCJpYXQiOjE3ODI4MTczMzl9.',
    algorithm: 'none',
  },
]
