import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { JsonEditor } from '../shared/JsonEditor'
import { AlgorithmSelector } from '../shared/AlgorithmSelector'
import { OutputToken } from '../shared/OutputToken'
import { KeyUpload } from '../shared/KeyUpload'
import { signJWT } from '../../utils/jwt/sign'
import { importPrivateKeyPEM, rsaImportParams, rsaPssImportParams, ecImportParams } from '../../utils/crypto/keygen'
import type { JwtAlgorithm } from '../../types/jwt.types'

export function EncoderPanel() {
  const [header, setHeader] = useState<Record<string, unknown>>({ alg: 'HS256', typ: 'JWT' })
  const [payload, setPayload] = useState<Record<string, unknown>>({ sub: 'user', iat: Math.floor(Date.now() / 1000) })
  const [algorithm, setAlgorithm] = useState<JwtAlgorithm>('HS256')
  const [hmacSecret, setHmacSecret] = useState('')
  const [pemKey, setPemKey] = useState('')
  const [pemError, setPemError] = useState<string | null>(null)

  const [encodedToken, setEncodedToken] = useState<string | null>(null)
  const [encodeError, setEncodeError] = useState<string | null>(null)
  const [isEncoding, setIsEncoding] = useState(false)

  const needsKey = algorithm !== 'none'
  const isHmac = algorithm.startsWith('HS')
  const keyReady = algorithm === 'none' || (isHmac ? !!hmacSecret : !!pemKey)

  const handleEncode = useCallback(async () => {
    setIsEncoding(true)
    setEncodedToken(null)
    setEncodeError(null)

    try {
      // Update alg in header
      const hdr = { ...header, alg: algorithm }

      let key: CryptoKey | Uint8Array | null = null

      if (algorithm === 'none') {
        key = null
      } else if (isHmac) {
        key = new TextEncoder().encode(hmacSecret)
      } else {
        // RSA or EC — import PEM
        const hash = { HS256: 'SHA-256', HS384: 'SHA-384', HS512: 'SHA-512' } as Record<string, string>
        const h = hash[algorithm] || 'SHA-256'

        if (algorithm.startsWith('RS')) {
          key = await importPrivateKeyPEM(pemKey, rsaImportParams(h))
        } else if (algorithm.startsWith('PS')) {
          key = await importPrivateKeyPEM(pemKey, rsaPssImportParams(h))
        } else if (algorithm.startsWith('ES')) {
          const curveMap: Record<string, string> = { ES256: 'P-256', ES384: 'P-384', ES512: 'P-521' }
          key = await importPrivateKeyPEM(pemKey, ecImportParams(curveMap[algorithm] || 'P-256'))
        }
      }

      const token = await signJWT(hdr, payload, { algorithm, key })
      setEncodedToken(token)
    } catch (e) {
      setEncodeError((e as Error).message)
    } finally {
      setIsEncoding(false)
    }
  }, [header, payload, algorithm, hmacSecret, pemKey, isHmac])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ maxWidth: 900, margin: '0 auto', padding: '28px 24px' }}
    >
      <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px' }}>Encode JWT</h2>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 24px' }}>
        Build a JWT from scratch — set the header, payload, algorithm, and signing key.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Header + Payload */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <JsonEditor label="Header" value={header} onChange={setHeader} />
          <JsonEditor label="Payload" value={payload} onChange={setPayload} />
        </div>

        {/* Algorithm + Key */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <AlgorithmSelector value={algorithm} onChange={setAlgorithm} />

          {needsKey && (
            isHmac ? (
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                  HMAC Secret
                </div>
                <input
                  type="text"
                  value={hmacSecret}
                  onChange={e => setHmacSecret(e.target.value)}
                  placeholder="Paste HMAC secret..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-code)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--mono)',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>
            ) : (
              <div>
                <KeyUpload label="Private Key (PEM)" onKeyLoaded={pem => { setPemKey(pem); setPemError(null) }} />
                {pemError && <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{pemError}</div>}
              </div>
            )
          )}
        </div>

        {/* Encode button */}
        <button
          onClick={handleEncode}
          disabled={isEncoding || !keyReady}
          style={{
            padding: '10px 24px',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            background: keyReady ? 'var(--accent)' : 'var(--bg-tertiary)',
            color: keyReady ? '#fff' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: 14,
            fontFamily: 'var(--sans)',
            cursor: keyReady ? 'pointer' : 'not-allowed',
            transition: 'all var(--transition-fast)',
            width: 'fit-content',
          }}
        >
          {isEncoding ? 'Encoding...' : '🔨 Encode Token'}
        </button>

        <OutputToken token={encodedToken} error={encodeError} isForging={isEncoding} />
      </div>
    </motion.div>
  )
}
