export interface SampleToken {
  label: string
  description: string
  token: string
  algorithm: string
  /** Public key PEM to verify this token (paste into the signature verifier) */
  publicKey?: string
}

export const SAMPLE_TOKENS: SampleToken[] = [
  {
    label: 'HS256 (valid)',
    description: 'HMAC-SHA256 — secret is "secret". Paste "secret" in the signature verifier to see ✅ Valid.',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsIm5hbWUiOiJUZXN0IFVzZXIiLCJpYXQiOjE3ODI4MTczMzksImV4cCI6MjU1NjIzOTczOX0.NMo-BMgxMzMYca41QTLor7vfyJM44LLMisQmgwp1t-U',
    algorithm: 'HS256',
  },
  {
    label: 'RS256 (valid)',
    description: 'RSA-SHA256 signed. Copy the public key below to verify → ✅ Valid.',
    token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InNhbXBsZS1yc2Eta2V5In0.eyJzdWIiOiJ0ZXN0ZXIiLCJpYXQiOjE3MTk3MDAwMDAsImV4cCI6MjAwMDAwMDAwMCwibmFtZSI6IlJTMjU2IFNhbXBsZSJ9.n6LQafL7VFmWB2a5-aagoshKdUb9QCR04iKhULAkjiu-OYe3AhAksvmQWc9BmAkVHyS21V0Bf4LndP1ndftLdpD1B8tFk4MwooH7TeoA3FulY--leOwmVInuxhT9ZjelmgtdlFWNYlgK7c3xqjzYEjY9QBZJmm-ZkAhBpuRGQ5LJ-1ow6ECLc76VSxA0ihPRPlzEKisAzMDnx-3zN6L1slkT-6MzA-KWbKIh-cy2t1vKuz2e8aFcenZhLsQmUAkftMPTfaM5TGsCvmRzadI90wE6xoQIfDyLA25y07rQitmstcdimlyDWIh6Vnq5WffgMucxhOfNtldc_mRcbILbwQ',
    algorithm: 'RS256',
    publicKey: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArXZCznbzpTnNw+1seGrk\nCVbZHA20l7JRZVryVw/Q+tXMRJ97PM3KePpk7KVoTLAoXhDajDCdYM/m2Ku+mixb\nTKK+BhtwW1+w3TE/eMJp3v4U35ji8SoYrgt7H7aBjOH9z+qQOwTvAvd+XLAaC2uM\nssDh8DIesNl0m7WHB+yPEQ6HN9uAbdGIbIV5doW4T5IbV2pVINCsfRl2MzceUkp3\nepePCu9fdxE0fNlCn9nvtfDFpit2A+/SO+HQrv6P8dkmYr01fJA/TVCjrK/JzQqD\nfjOKBD0OB1lYAM2KYESErf4NxHR3GZq7bwdk77dmZ1SsNb5nbmmUYfU66X4nKm97\nvQIDAQAB\n-----END PUBLIC KEY-----',
  },
  {
    label: 'ES256 (valid)',
    description: 'ECDSA P-256 signed. Copy the public key below to verify → ✅ Valid.',
    token: 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InNhbXBsZS1lYy1rZXkifQ.eyJzdWIiOiJ0ZXN0ZXIiLCJpYXQiOjE3MTk3MDAwMDAsImV4cCI6MjAwMDAwMDAwMCwibmFtZSI6IkVTMjU2IFNhbXBsZSJ9.MEYCIQDNyApuhTXXyLvg8sLbpoV6oJIJu7SLoiCTatz1MqmFJAIhAKNYZPlvUZCoRMsgY1w_IEESqd8A9ENn0jaSRahKSgke',
    algorithm: 'ES256',
    publicKey: '-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAET17bPV48rx5nTMNr9JSR8f1lRj6C\nY6fYwPKGXnvEarQN2MewtyfqFDkmLNT0OwViBz6q6c+S1jp36owDR/4Trg==\n-----END PUBLIC KEY-----',
  },
  {
    label: 'HS256 (expired)',
    description: 'HMAC-SHA256 token — already expired. See the ⚠ claim label in the decoder.',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0ZXIiLCJpYXQiOjE3ODI4MTczMzksImV4cCI6MTc4MjgyMDk0MCwibmFtZSI6IkV4cGlyZWQgVG9rZW4ifQ.iu0GcUevjBqB-TFQ8AXSYKgWMpZPu-Z-6QCkHRgV2UE',
    algorithm: 'HS256',
  },
  {
    label: 'none (no signature)',
    description: 'alg=none — no signature. Should never be accepted by well-configured servers. Try forging one with alg=none in an attack panel.',
    token: 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhbm9ueW1vdXMiLCJpYXQiOjE3ODI4MTczMzl9.',
    algorithm: 'none',
  },
]
