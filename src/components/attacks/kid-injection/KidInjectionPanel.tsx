import { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useJWTState } from '../../../context/JWTContext'
import { useForgedToken } from '../../../hooks/useForgedToken'
import { JsonEditor } from '../../shared/JsonEditor'
import { OutputToken } from '../../shared/OutputToken'
import { AlgorithmSelector } from '../../shared/AlgorithmSelector'
import { KID_PAYLOADS } from '../../../constants/kid-payloads'
import type { JwtAlgorithm } from '../../../types/jwt.types'
import type { KidPayload } from '../../../types/crypto.types'

export function KidInjectionPanel() {
  const { decoded } = useJWTState()
  const {
    modifiedHeader, modifiedPayload, signingAlgorithm,
    forgedToken, forgeError, isForging,
    forgeToken, setModifiedHeader, setModifiedPayload, setSigningAlgorithm,
  } = useForgedToken()

  const [selectedCategory, setSelectedCategory] = useState<string>('path-traversal')
  const [selectedPayload, setSelectedPayload] = useState<KidPayload | null>(null)
  const [secretText, setSecretText] = useState('')

  const filteredPayloads = useMemo(
    () => KID_PAYLOADS.filter(p => p.category === selectedCategory),
    [selectedCategory],
  )

  const categories = useMemo(() => {
    const seen = new Set<string>()
    const cats: { value: string; label: string }[] = []
    for (const p of KID_PAYLOADS) {
      if (!seen.has(p.category)) {
        seen.add(p.category)
        const labels: Record<string, string> = {
          'path-traversal': 'Path Traversal',
          'sqli': 'SQL Injection',
          'command-injection': 'Command Injection',
          'nosql': 'NoSQL Injection',
        }
        cats.push({ value: p.category, label: labels[p.category] || p.category })
      }
    }
    return cats
  }, [])

  const handleSelectPayload = useCallback((payload: KidPayload) => {
    setSelectedPayload(payload)
    setSecretText(payload.secretValue)

    if (modifiedHeader) {
      setModifiedHeader({
        ...modifiedHeader,
        kid: payload.value,
        alg: 'HS256',
      })
    }
    setSigningAlgorithm('HS256')
  }, [modifiedHeader, setModifiedHeader, setSigningAlgorithm])

  const handleForge = useCallback(async () => {
    const secret = new TextEncoder().encode(secretText)
    await forgeToken(secret, 'HS256')
  }, [secretText, forgeToken])

  const handleAlgChange = useCallback((alg: JwtAlgorithm) => {
    setSigningAlgorithm(alg)
    if (modifiedHeader) {
      setModifiedHeader({ ...modifiedHeader, alg })
    }
  }, [modifiedHeader, setModifiedHeader, setSigningAlgorithm])

  if (!decoded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-secondary)',
          overflow: 'hidden',
        }}
      >
        <PanelHeader
          title="KID Injection"
          desc="Inject payloads into the kid header to exploit key lookup"
          icon="🔑"
        />
        <div style={{
          padding: '40px 18px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: 14,
        }}>
          Paste a JWT token in the Decoder above first.
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-secondary)',
        overflow: 'hidden',
      }}
    >
      <PanelHeader
        title="KID Injection"
        desc="Inject SQL/command/path traversal payloads into the kid header to exploit key lookup logic"
        icon="🔑"
      />

      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Category tabs */}
        <div>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: 8,
          }}>
            Payload Library
          </div>
          <div style={{ display: 'flex', gap: 0, marginBottom: 8 }}>
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                style={{
                  padding: '6px 14px',
                  fontSize: 13,
                  border: `1px solid ${selectedCategory === cat.value ? 'var(--accent)' : 'var(--border)'}`,
                  background: selectedCategory === cat.value ? 'var(--accent-bg)' : 'var(--bg-tertiary)',
                  color: selectedCategory === cat.value ? 'var(--accent)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontFamily: 'var(--sans)',
                  fontWeight: 500,
                  transition: 'all var(--transition-fast)',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Payload list */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
          }}>
            {filteredPayloads.map(p => {
              const isSelected = selectedPayload?.value === p.value
              return (
                <button
                  key={p.value}
                  onClick={() => handleSelectPayload(p)}
                  style={{
                    padding: '6px 12px',
                    fontSize: 12,
                    border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'var(--accent-bg)' : 'var(--bg-tertiary)',
                    color: isSelected ? 'var(--accent)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontFamily: 'var(--mono)',
                    transition: 'all var(--transition-fast)',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'var(--border-hover)'
                      e.currentTarget.style.color = 'var(--text-primary)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'var(--border)'
                      e.currentTarget.style.color = 'var(--text-secondary)'
                    }
                  }}
                >
                  {p.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected payload info */}
        {selectedPayload && (
          <div style={{
            padding: '10px 14px',
            background: 'var(--accent-bg)',
            border: '1px solid var(--accent-border)',
            borderRadius: 'var(--radius-sm)',
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', marginBottom: 4 }}>
              Selected: <code style={{ fontFamily: 'var(--mono)' }}>{selectedPayload.value}</code>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              💡 {selectedPayload.secretHint}
            </div>
          </div>
        )}

        {/* Header/Payload editors */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <JsonEditor
            label="Modified Header"
            value={modifiedHeader || {}}
            onChange={setModifiedHeader}
          />
          <JsonEditor
            label="Modified Payload"
            value={modifiedPayload || {}}
            onChange={setModifiedPayload}
          />
        </div>

        <AlgorithmSelector value={signingAlgorithm} onChange={handleAlgChange} />

        {/* Secret input */}
        <div>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: 6,
          }}>
            Signing Secret
          </div>
          <input
            type="text"
            value={secretText}
            onChange={e => setSecretText(e.target.value)}
            placeholder="e.g., mysecret (or empty string for /dev/null)"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-code)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--mono)',
              fontSize: 14,
              outline: 'none',
              transition: 'border-color var(--transition-fast)',
            }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
          />
          {selectedPayload && !secretText && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--mono)' }}>
              Secret is empty — this is correct for path traversal to /dev/null
            </div>
          )}
        </div>

        {/* Forge */}
        <button
          onClick={handleForge}
          disabled={isForging}
          style={{
            padding: '10px 24px',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 14,
            fontFamily: 'var(--sans)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            width: 'fit-content',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
        >
          {isForging ? 'Forging...' : '🔨 Forge Token'}
        </button>

        <OutputToken token={forgedToken} error={forgeError} isForging={isForging} />
      </div>
    </motion.div>
  )
}

function PanelHeader({ title, desc, icon }: { title: string; desc: string; icon: string }) {
  return (
    <div style={{
      padding: '12px 18px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-tertiary)',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{desc}</div>
      </div>
    </div>
  )
}
