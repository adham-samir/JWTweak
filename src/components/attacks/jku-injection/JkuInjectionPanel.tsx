import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useJWTState } from '../../../context/JWTContext'
import { useForgedToken } from '../../../hooks/useForgedToken'
import { useKeyManager } from '../../../hooks/useKeyManager'
import { JsonEditor } from '../../shared/JsonEditor'
import { OutputToken } from '../../shared/OutputToken'
import { CopyButton } from '../../shared/CopyButton'

export function JkuInjectionPanel() {
  const { decoded } = useJWTState()
  const {
    modifiedHeader, modifiedPayload,
    forgedToken, forgeError, isForging,
    forgeToken, setModifiedHeader, setModifiedPayload
  } = useForgedToken()
  const { activeKey, generateRSA } = useKeyManager()

  const [jkuUrl, setJkuUrl] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateKeypair = useCallback(async () => {
    setIsGenerating(true)
    try {
      await generateRSA({ modulusLength: 2048, hash: 'SHA-256' })
    } finally {
      setIsGenerating(false)
    }
  }, [generateRSA])

  const handleForge = useCallback(async () => {
    if (!activeKey || !modifiedHeader) return

    // Set the jku header
    const header = { ...modifiedHeader, jku: jkuUrl, alg: 'RS256' }
    setModifiedHeader(header)

    // Forge with the generated private key
    await forgeToken(activeKey.privateKey, 'RS256')
  }, [activeKey, jkuUrl, modifiedHeader, forgeToken, setModifiedHeader])

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
        <PanelHeader title="JKU Injection" desc="Embed attacker-controlled JWKS URL in jku header" icon="🌐" />
        <div style={{ padding: '40px 18px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
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
        title="JKU Injection"
        desc="Generate RSA keypair, host JWKS at a URL you control, embed jku header pointing to it"
        icon="🌐"
      />

      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* JKU URL */}
        <div>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: 6,
          }}>
            JKU URL (where JWKS is hosted)
          </div>
          <input
            type="text"
            value={jkuUrl}
            onChange={e => setJkuUrl(e.target.value)}
            placeholder="https://gist.githubusercontent.com/.../jwks.json"
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
        </div>

        {/* Keypair generation */}
        <div>
          <button
            onClick={handleGenerateKeypair}
            disabled={isGenerating}
            style={{
              padding: '10px 24px',
              border: '1px solid var(--accent)',
              borderRadius: 'var(--radius-md)',
              background: isGenerating ? 'var(--bg-tertiary)' : 'var(--accent-bg)',
              color: isGenerating ? 'var(--text-muted)' : 'var(--accent)',
              fontWeight: 600,
              fontSize: 14,
              fontFamily: 'var(--sans)',
              cursor: isGenerating ? 'wait' : 'pointer',
              transition: 'all var(--transition-fast)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: 'fit-content',
            }}
          >
            {isGenerating ? '⏳ Generating...' : '🔑 Generate RSA Keypair'}
          </button>
        </div>

        {/* JWKS output */}
        {activeKey?.jwks && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.2 }}
          >
            <div style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              background: 'var(--bg-secondary)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 14px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-tertiary)',
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  JWKS (host this at the JKU URL above)
                </span>
                <CopyButton text={JSON.stringify(activeKey.jwks, null, 2)} label="Copy JWKS" />
              </div>
              <pre style={{
                fontFamily: 'var(--mono)',
                fontSize: 13,
                color: 'var(--text-primary)',
                padding: '12px 14px',
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                maxHeight: 300,
                overflowY: 'auto',
                background: 'var(--bg-code)',
              }}>
                {JSON.stringify(activeKey.jwks, null, 2)}
              </pre>
            </div>
          </motion.div>
        )}

        {/* Extracted n & e */}
        {activeKey?.publicKeyJwk && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.2 }}
          >
            <div style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              background: 'var(--bg-secondary)',
            }}>
              <div style={{
                padding: '8px 14px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-tertiary)',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Extracted n & e (JWK format)
              </div>
              <div style={{ padding: '10px 14px', background: 'var(--bg-code)' }}>
                <KeyParamRow label="n" value={(activeKey.publicKeyJwk as any).n || ''} />
                <KeyParamRow label="e" value={(activeKey.publicKeyJwk as any).e || ''} />
              </div>
            </div>
          </motion.div>
        )}

        {/* Payload editor */}
        <JsonEditor
          label="Payload"
          value={modifiedPayload || { user: 'admin' }}
          onChange={setModifiedPayload}
        />

        {/* Forge */}
        <button
          onClick={handleForge}
          disabled={isForging || !activeKey || !jkuUrl}
          style={{
            padding: '10px 24px',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            background: (activeKey && jkuUrl) ? 'var(--accent)' : 'var(--bg-tertiary)',
            color: (activeKey && jkuUrl) ? '#fff' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: 14,
            fontFamily: 'var(--sans)',
            cursor: (activeKey && jkuUrl) ? 'pointer' : 'not-allowed',
            transition: 'all var(--transition-fast)',
            width: 'fit-content',
          }}
          onMouseEnter={e => {
            if (activeKey && jkuUrl) e.currentTarget.style.background = 'var(--accent-hover)'
          }}
          onMouseLeave={e => {
            if (activeKey && jkuUrl) e.currentTarget.style.background = 'var(--accent)'
          }}
        >
          {isForging ? 'Forging...' : '🔨 Forge Token'}
        </button>

        <OutputToken token={forgedToken} error={forgeError} isForging={isForging} />
      </div>
    </motion.div>
  )
}

function KeyParamRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'flex',
      gap: 12,
      marginBottom: 6,
      alignItems: 'flex-start',
    }}>
      <span style={{
        fontFamily: 'var(--mono)',
        fontSize: 13,
        color: 'var(--text-muted)',
        fontWeight: 600,
        minWidth: 20,
      }}>
        {label}:
      </span>
      <span style={{
        fontFamily: 'var(--mono)',
        fontSize: 12,
        color: 'var(--text-secondary)',
        wordBreak: 'break-all',
      }}>
        {value}
        <CopyButton text={value} />
      </span>
    </div>
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
