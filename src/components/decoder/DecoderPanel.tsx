import { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useJWT } from '../../hooks/useJWT'
import { TokenDisplay } from '../shared/TokenDisplay'
import { ClaimLabels } from '../shared/ClaimLabels'
import { CopyButton } from '../shared/CopyButton'
import { SAMPLE_TOKENS } from '../../constants/sample-tokens'
import { SignatureVerifier } from '../shared/SignatureVerifier'

export function DecoderPanel() {
  const { rawToken, decoded, decodeError, setToken, clearToken } = useJWT()
  const [showSamples, setShowSamples] = useState(false)

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setToken(e.target.value)
  }, [setToken])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-secondary)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Title bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-tertiary)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: decoded ? 'var(--success)' : 'var(--text-muted)',
            boxShadow: decoded ? '0 0 8px rgba(63, 185, 128, 0.4)' : undefined,
            transition: 'all var(--transition-fast)',
          }} />
          <span style={{ fontSize: 15, fontWeight: 600 }}>
            JWT Decoder
          </span>
          {decoded && (
            <span style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              fontFamily: 'var(--mono)',
              background: 'var(--bg-code)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
            }}>
              {String(decoded.header.json.alg || 'unknown')}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowSamples(!showSamples)}
            style={{
              padding: '4px 10px',
              fontSize: 12,
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontFamily: 'var(--sans)',
              fontWeight: 500,
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--border-hover)'
              e.currentTarget.style.color = 'var(--text-primary)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.color = 'var(--text-secondary)'
            }}
          >
            📦 Samples
          </button>
          {rawToken && (
            <button
              onClick={clearToken}
              style={{
                padding: '4px 10px',
                fontSize: 12,
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontFamily: 'var(--sans)',
                fontWeight: 500,
                transition: 'all var(--transition-fast)',
              }}
            >
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* Sample tokens */}
      <AnimatePresence>
        {showSamples && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', borderBottom: '1px solid var(--border)' }}
          >
            <div style={{ padding: '12px 18px', display: 'flex', gap: 8, flexWrap: 'wrap', background: 'var(--bg-tertiary)' }}>
              {SAMPLE_TOKENS.map(sample => (
                <button
                  key={sample.label}
                  onClick={() => {
                    setToken(sample.token)
                    setShowSamples(false)
                  }}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontFamily: 'var(--sans)',
                    fontSize: 13,
                    fontWeight: 500,
                    transition: 'all var(--transition-fast)',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--accent)'
                    e.currentTarget.style.color = 'var(--text-primary)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{sample.label}</div>
                  <div style={{ fontSize: 11, opacity: 0.7, marginTop: 1 }}>{sample.description}</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div style={{ padding: '16px 18px' }}>
        <textarea
          value={rawToken}
          onChange={handleInputChange}
          placeholder="Paste a JWT token here... (eyJhbGciOi...)"
          spellCheck={false}
          style={{
            width: '100%',
            minHeight: 60,
            padding: '12px 14px',
            border: `1px solid ${decodeError ? 'var(--danger)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-code)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--mono)',
            fontSize: 14,
            lineHeight: 1.5,
            resize: 'vertical',
            outline: 'none',
            transition: 'border-color var(--transition-fast)',
          }}
          onFocus={e => e.currentTarget.style.borderColor = decodeError ? 'var(--danger)' : 'var(--accent)'}
          onBlur={e => e.currentTarget.style.borderColor = decodeError ? 'var(--danger)' : 'var(--border)'}
        />

        {decodeError && (
          <div style={{
            marginTop: 8,
            padding: '8px 12px',
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 13,
            color: 'var(--danger)',
            fontFamily: 'var(--mono)',
          }}>
            {decodeError}
          </div>
        )}
      </div>

      {/* Decoded parts */}
      <AnimatePresence>
        {decoded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ overflow: 'hidden' }}
          >
            {/* Claim labels */}
            <div style={{ padding: '0 18px 12px' }}>
              <ClaimLabels payload={decoded.payload.json} />
            </div>

            {/* Three-part display */}
            <div style={{ padding: '0 18px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <TokenDisplay
                label="Header"
                color="var(--token-header)"
                part={decoded.header}
              />
              <TokenDisplay
                label="Payload"
                color="var(--token-payload)"
                part={decoded.payload}
              />
              {decoded.signature.raw && (
                <div
                  style={{
                    border: '1px solid var(--border)',
                    borderLeft: '3px solid var(--token-signature)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    background: 'var(--bg-secondary)',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 14px',
                    borderBottom: '1px solid var(--border)',
                    background: 'var(--bg-tertiary)',
                  }}>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--token-signature)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}>
                      <span style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: 'var(--token-signature)',
                        display: 'inline-block',
                      }} />
                      Signature
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
                      {decoded.signature.bytes.length} bytes
                    </span>
                  </div>

                  <div style={{
                    padding: '8px 14px',
                    fontFamily: 'var(--mono)',
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                    wordBreak: 'break-all',
                    background: 'var(--bg-code)',
                    lineHeight: 1.6,
                    borderBottom: '1px solid var(--border)',
                  }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{'raw> '}</span>
                    {decoded.signature.raw}
                  </div>

                  <div style={{ padding: '8px 14px' }}>
                    <SignatureVerifier
                      algorithm={decoded.header.json.alg as string}
                      messageBytes={new TextEncoder().encode(`${decoded.parts.headerB64}.${decoded.parts.payloadB64}`)}
                      signatureBytes={decoded.signature.bytes}
                    />
                  </div>
                </div>
              )}

              {/* Full token copy */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <CopyButton text={decoded.parts.full} label="Copy Token" size="md" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!decoded && !decodeError && !rawToken && (
        <div style={{
          padding: '40px 18px',
          textAlign: 'center',
          color: 'var(--text-muted)',
        }}>
          <div style={{
            fontFamily: 'var(--mono)',
            fontSize: 48,
            marginBottom: 8,
            opacity: 0.15,
          }}>
            {'{ }'}
          </div>
          <div style={{ fontSize: 14 }}>
            Paste a JWT above to decode it
          </div>
          <div style={{ fontSize: 12, marginTop: 4, opacity: 0.6 }}>
            or click "Samples" to try a demo token
          </div>
        </div>
      )}
    </motion.div>
  )
}
