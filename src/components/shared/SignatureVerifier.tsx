import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { hmacVerify } from '../../utils/crypto/hmac'
import { rsaVerify } from '../../utils/crypto/rsa'
import { ecdsaVerify } from '../../utils/crypto/ecdsa'
import { importPublicKeyPEM, rsaImportParams, rsaPssImportParams, ecImportParams } from '../../utils/crypto/keygen'
import { ALGORITHM_TO_HASH } from '../../constants/algorithms'
import type { JwtAlgorithm } from '../../types/jwt.types'

interface SignatureVerifierProps {
  algorithm: string | undefined
  messageBytes: Uint8Array
  signatureBytes: Uint8Array
}

type KeyType = 'hmac' | 'pem'
type VerifyResult = { valid: boolean; message: string } | null

export function SignatureVerifier({ algorithm, messageBytes, signatureBytes }: SignatureVerifierProps) {
  const [keyType, setKeyType] = useState<KeyType>('hmac')
  const [keyText, setKeyText] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [result, setResult] = useState<VerifyResult>(null)

  const alg = (algorithm || 'none') as JwtAlgorithm

  const handleVerify = useCallback(async () => {
    if (!keyText.trim() || !signatureBytes.length) return

    setIsVerifying(true)
    setResult(null)

    try {
      let valid = false

      if (alg === 'none') {
        setResult({ valid: false, message: 'Token uses "none" algorithm — no signature to verify.' })
        return
      }

      if (alg.startsWith('HS')) {
        // HMAC
        const secret = new TextEncoder().encode(keyText)
        valid = await hmacVerify(alg as 'HS256' | 'HS384' | 'HS512', secret, signatureBytes.buffer as ArrayBuffer, messageBytes)

      } else if (alg.startsWith('RS')) {
        // RSA PKCS1v15
        const hash = ALGORITHM_TO_HASH[alg] || 'SHA-256'
        const publicKey = await importPublicKeyPEM(keyText, rsaImportParams(hash))
        valid = await rsaVerify(publicKey, signatureBytes.buffer as ArrayBuffer, messageBytes)

      } else if (alg.startsWith('PS')) {
        // RSA-PSS
        const hash = ALGORITHM_TO_HASH[alg] || 'SHA-256'
        const keyData = await importPublicKeyPEM(keyText, rsaPssImportParams(hash))
        valid = await crypto.subtle.verify(
          { name: 'RSA-PSS', saltLength: 32 },
          keyData,
          signatureBytes.buffer as ArrayBuffer,
          messageBytes as BufferSource,
        )

      } else if (alg.startsWith('ES')) {
        // ECDSA
        const curveMap: Record<string, string> = { ES256: 'P-256', ES384: 'P-384', ES512: 'P-521' }
        const curve = curveMap[alg] || 'P-256'
        const publicKey = await importPublicKeyPEM(keyText, ecImportParams(curve))
        valid = await ecdsaVerify(publicKey, signatureBytes.buffer as ArrayBuffer, messageBytes)

      } else {
        setResult({ valid: false, message: `Unknown algorithm: ${alg}` })
        return
      }

      setResult({
        valid,
        message: valid ? 'Signature is valid ✅' : 'Signature is invalid ❌ — key does not match',
      })
    } catch (e) {
      setResult({
        valid: false,
        message: `Verification error: ${(e as Error).message}`,
      })
    } finally {
      setIsVerifying(false)
    }
  }, [keyText, alg, signatureBytes, messageBytes])

  const isNoneAlg = alg === 'none'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {isNoneAlg ? (
        <div style={{
          padding: '10px 14px',
          background: 'var(--bg-code)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 13,
          color: 'var(--text-muted)',
          fontFamily: 'var(--mono)',
        }}>
          Algorithm is "none" — no signature to verify
        </div>
      ) : (
        <>
          {/* Key type selector */}
          <div style={{ display: 'flex', gap: 0 }}>
            {([
              { id: 'hmac' as KeyType, label: 'HMAC Secret' },
              { id: 'pem' as KeyType, label: 'Public Key (PEM)' },
            ]).map(kt => (
              <button
                key={kt.id}
                onClick={() => { setKeyType(kt.id); setResult(null) }}
                style={{
                  padding: '5px 14px',
                  fontSize: 12,
                  fontWeight: keyType === kt.id ? 600 : 400,
                  border: `1px solid ${keyType === kt.id ? 'var(--accent)' : 'var(--border)'}`,
                  background: keyType === kt.id ? 'var(--accent-bg)' : 'var(--bg-tertiary)',
                  color: keyType === kt.id ? 'var(--accent)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontFamily: 'var(--sans)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {kt.label}
              </button>
            ))}
          </div>

          {/* Key input */}
          <textarea
            value={keyText}
            onChange={e => { setKeyText(e.target.value); setResult(null) }}
            placeholder={keyType === 'hmac' ? 'Paste HMAC secret...' : '-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----'}
            spellCheck={false}
            style={{
              width: '100%',
              minHeight: keyType === 'pem' ? 120 : 50,
              padding: '10px 12px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-code)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--mono)',
              fontSize: 12,
              outline: 'none',
              resize: 'vertical',
              transition: 'border-color var(--transition-fast)',
            }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
          />

          {/* Verify button */}
          <button
            onClick={handleVerify}
            disabled={isVerifying || !keyText.trim()}
            style={{
              padding: '8px 20px',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              background: keyText.trim() ? 'var(--accent)' : 'var(--bg-tertiary)',
              color: keyText.trim() ? '#fff' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: 13,
              fontFamily: 'var(--sans)',
              cursor: keyText.trim() ? 'pointer' : 'not-allowed',
              transition: 'all var(--transition-fast)',
              width: 'fit-content',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {isVerifying ? 'Verifying...' : 'Verify Signature'}
          </button>
        </>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              padding: '10px 14px',
              background: result.valid ? 'var(--success-bg)' : 'var(--danger-bg)',
              border: `1px solid ${result.valid ? 'var(--success)' : 'var(--danger)'}`,
              borderRadius: 'var(--radius-sm)',
              fontSize: 13,
              fontWeight: 500,
              color: result.valid ? 'var(--success)' : 'var(--danger)',
              fontFamily: 'var(--mono)',
            }}
          >
            {result.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
