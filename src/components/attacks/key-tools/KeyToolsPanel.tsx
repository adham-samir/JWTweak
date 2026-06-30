import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { CopyButton } from '../../shared/CopyButton'
import { KeyUpload } from '../../shared/KeyUpload'
import { parsePEM, formatPEM } from '../../../utils/pem'
import { base64urlToBigInt } from '../../../utils/crypto/jwk-utils'
import { generateRSAKeypair, exportPublicKeyPEM, exportPrivateKeyPEM, exportKeyJWK } from '../../../utils/crypto/keygen'
import { buildJWKS } from '../../../utils/crypto/jwk-utils'

type SubTab = 'pem-to-ne' | 'ne-to-pem' | 'keygen' | 'jwk-explorer'

export function KeyToolsPanel() {
  const [subTab, setSubTab] = useState<SubTab>('pem-to-ne')
  // Key tools don't need the decoded token

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
      <div style={{
        padding: '12px 18px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-tertiary)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <span style={{ fontSize: 18 }}>🛠</span>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Key Tools</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
            PEM ↔ JWK conversion, key generation, parameter extraction
          </div>
        </div>
      </div>

      {/* Sub-tab bar */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-tertiary)',
      }}>
        {([
          { id: 'pem-to-ne' as SubTab, label: 'PEM → n,e' },
          { id: 'ne-to-pem' as SubTab, label: 'n,e → PEM' },
          { id: 'keygen' as SubTab, label: 'Key Generator' },
          { id: 'jwk-explorer' as SubTab, label: 'JWK Explorer' },
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            style={{
              padding: '10px 16px',
              fontSize: 13,
              fontWeight: subTab === tab.id ? 600 : 400,
              border: 'none',
              borderBottom: `2px solid ${subTab === tab.id ? 'var(--accent)' : 'transparent'}`,
              background: subTab === tab.id ? 'var(--bg-secondary)' : 'transparent',
              color: subTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontFamily: 'var(--sans)',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={e => {
              if (subTab !== tab.id) {
                e.currentTarget.style.color = 'var(--text-primary)'
              }
            }}
            onMouseLeave={e => {
              if (subTab !== tab.id) {
                e.currentTarget.style.color = 'var(--text-secondary)'
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '16px 18px' }}>
        <AnimatedContent key={subTab}>
          {subTab === 'pem-to-ne' && <PemToNe />}
          {subTab === 'ne-to-pem' && <NeToPem />}
          {subTab === 'keygen' && <KeyGenerator />}
          {subTab === 'jwk-explorer' && <JwkExplorer />}
        </AnimatedContent>
      </div>
    </motion.div>
  )
}

function AnimatedContent({ children, key }: { children: React.ReactNode; key: string }) {
  return (
    <motion.div
      key={key}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
    >
      {children}
    </motion.div>
  )
}

// ─── PEM → n,e ─────────────────────────────────────────────────

function PemToNe() {
  const [, setPem] = useState('')
  const [result, setResult] = useState<{ n: string; e: string; label: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePemLoaded = useCallback((pemText: string) => {
    setPem(pemText)
    setError(null)
    try {
      const { label, der } = parsePEM(pemText)

      // Import the public key as SPKI
      crypto.subtle.importKey(
        'spki',
        der,
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        true,
        ['verify'],
      ).then(async (key) => {
        const jwk = await crypto.subtle.exportKey('jwk', key)
        setResult({
          n: (jwk as any).n || '',
          e: (jwk as any).e || '',
          label,
        })
      }).catch(err => {
        setError(`Failed to import key: ${err.message}`)
      })
    } catch (err) {
      setError((err as Error).message)
    }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <KeyUpload label="Upload Public Key PEM" onKeyLoaded={handlePemLoaded} />

      {error && (
        <div style={{ padding: '10px 14px', background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--danger)', fontFamily: 'var(--mono)' }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Key type: <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--mono)' }}>{result.label}</span>
          </div>
          <KeyParamRow label="n" value={result.n} />
          <KeyParamRow label="e" value={result.e} />
        </div>
      )}
    </div>
  )
}

// ─── n,e → PEM ─────────────────────────────────────────────────

function NeToPem() {
  const [nInput, setNInput] = useState('')
  const [eInput, setEInput] = useState('AQAB')
  const [pemResult, setPemResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleReconstruct = useCallback(async () => {
    setError(null)
    try {
      // Validate inputs by attempting to parse as bigint
      base64urlToBigInt(nInput.trim())
      base64urlToBigInt(eInput.trim())

      const jwk = {
        kty: 'RSA',
        n: nInput.trim(),
        e: eInput.trim(),
      }

      const key = await crypto.subtle.importKey(
        'jwk',
        jwk,
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        true,
        ['verify'],
      )

      const spki = await crypto.subtle.exportKey('spki', key)
      const pem = formatPEM(spki, 'PUBLIC KEY')
      setPemResult(pem)
    } catch (err) {
      setError((err as Error).message)
    }
  }, [nInput, eInput])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
          n (modulus, base64url)
        </div>
        <textarea
          value={nInput}
          onChange={e => setNInput(e.target.value)}
          placeholder="Paste the base64url-encoded modulus..."
          spellCheck={false}
          style={{
            width: '100%',
            minHeight: 60,
            padding: '10px 12px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-code)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--mono)',
            fontSize: 13,
            outline: 'none',
            resize: 'vertical',
          }}
        />
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
          e (exponent, base64url)
        </div>
        <input
          type="text"
          value={eInput}
          onChange={e => setEInput(e.target.value)}
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
          }}
        />
      </div>

      <button
        onClick={handleReconstruct}
        disabled={!nInput}
        style={{
          padding: '10px 24px',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          background: nInput ? 'var(--accent)' : 'var(--bg-tertiary)',
          color: nInput ? '#fff' : 'var(--text-muted)',
          fontWeight: 600,
          fontSize: 14,
          fontFamily: 'var(--sans)',
          cursor: nInput ? 'pointer' : 'not-allowed',
          width: 'fit-content',
        }}
      >
        Reconstruct PEM
      </button>

      {error && (
        <div style={{ padding: '10px 14px', background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--danger)', fontFamily: 'var(--mono)' }}>
          {error}
        </div>
      )}

      {pemResult && (
        <div style={{
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          background: 'var(--bg-secondary)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 14px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg-tertiary)',
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Reconstructed PEM
            </span>
            <CopyButton text={pemResult} label="Copy PEM" />
          </div>
          <pre style={{
            fontFamily: 'var(--mono)',
            fontSize: 13,
            color: 'var(--text-primary)',
            padding: '12px 14px',
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            background: 'var(--bg-code)',
          }}>
            {pemResult}
          </pre>
        </div>
      )}
    </div>
  )
}

// ─── Key Generator ─────────────────────────────────────────────

function KeyGenerator() {
  const [keyType, setKeyType] = useState<'RSA-2048' | 'RSA-4096'>('RSA-2048')
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<{
    publicPem: string
    privatePem: string
    jwk: JsonWebKey
    jwks: object
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true)
    setError(null)
    try {
      const size = keyType === 'RSA-4096' ? 4096 : 2048
      const hash = keyType === 'RSA-4096' ? 'SHA-384' as const : 'SHA-256' as const
      const keypair = await generateRSAKeypair({ modulusLength: size, hash })

      const publicPem = await exportPublicKeyPEM(keypair.publicKey)
      const privatePem = await exportPrivateKeyPEM(keypair.privateKey)
      const jwk = await exportKeyJWK(keypair.publicKey)
      const jwks = buildJWKS([jwk])

      setResult({ publicPem, privatePem, jwk, jwks })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsGenerating(false)
    }
  }, [keyType])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <select
          value={keyType}
          onChange={e => setKeyType(e.target.value as any)}
          style={{
            padding: '8px 12px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-code)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--mono)',
            fontSize: 13,
            outline: 'none',
          }}
        >
          <option value="RSA-2048">RSA 2048-bit (RS256)</option>
          <option value="RSA-4096">RSA 4096-bit (RS384)</option>
        </select>
        <button
          onClick={handleGenerate}
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
          }}
        >
          {isGenerating ? '⏳ Generating...' : '🔑 Generate'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--danger)', fontFamily: 'var(--mono)' }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <PemOutput label="Public Key (PEM)" pem={result.publicPem} />
          <PemOutput label="Private Key (PEM)" pem={result.privatePem} />
          <PemOutput label="JWK" pem={JSON.stringify(result.jwk, null, 2)} />
          <PemOutput label="JWKS" pem={JSON.stringify(result.jwks, null, 2)} />
        </div>
      )}
    </div>
  )
}

// ─── JWK Explorer ──────────────────────────────────────────────

function JwkExplorer() {
  const [jwkInput, setJwkInput] = useState('')
  const [parsed, setParsed] = useState<JsonWebKey | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleExplore = useCallback(() => {
    setError(null)
    try {
      const obj = JSON.parse(jwkInput)
      if (obj.keys) {
        setParsed(obj.keys[0] || obj)
      } else {
        setParsed(obj)
      }
    } catch (err) {
      setError((err as Error).message)
    }
  }, [jwkInput])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
          JWK JSON
        </div>
        <textarea
          value={jwkInput}
          onChange={e => setJwkInput(e.target.value)}
          placeholder='Paste a JWK or JWKS JSON...'
          spellCheck={false}
          style={{
            width: '100%',
            minHeight: 120,
            padding: '10px 12px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-code)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--mono)',
            fontSize: 13,
            outline: 'none',
            resize: 'vertical',
          }}
        />
      </div>

      <button
        onClick={handleExplore}
        disabled={!jwkInput}
        style={{
          padding: '10px 24px',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          background: jwkInput ? 'var(--accent)' : 'var(--bg-tertiary)',
          color: jwkInput ? '#fff' : 'var(--text-muted)',
          fontWeight: 600,
          fontSize: 14,
          fontFamily: 'var(--sans)',
          cursor: jwkInput ? 'pointer' : 'not-allowed',
          width: 'fit-content',
        }}
      >
        Explore JWK
      </button>

      {error && (
        <div style={{ padding: '10px 14px', background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--danger)', fontFamily: 'var(--mono)' }}>
          {error}
        </div>
      )}

      {parsed && (
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
            Parsed JWK
          </div>
          <div style={{ padding: '10px 14px', background: 'var(--bg-code)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 12px', fontFamily: 'var(--mono)', fontSize: 13 }}>
              {Object.entries(parsed).map(([key, value]) => (
                <>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{key}:</span>
                  <span style={{ color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                    {typeof value === 'string' ? value : JSON.stringify(value)}
                  </span>
                </>
              ))}
            </div>
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                Key type: <span style={{ color: 'var(--accent)', fontFamily: 'var(--mono)' }}>{parsed.kty || 'unknown'}</span>
                {parsed.alg && <> · Algorithm: <span style={{ color: 'var(--accent)', fontFamily: 'var(--mono)' }}>{parsed.alg}</span></>}
                {parsed.use && <> · Use: <span style={{ color: 'var(--accent)', fontFamily: 'var(--mono)' }}>{parsed.use}</span></>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Shared sub-components ─────────────────────────────────────

function KeyParamRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
    }}>
      <span style={{
        fontFamily: 'var(--mono)',
        fontSize: 13,
        color: 'var(--text-muted)',
        fontWeight: 600,
        minWidth: 24,
      }}>
        {label}:
      </span>
      <span style={{
        fontFamily: 'var(--mono)',
        fontSize: 12,
        color: 'var(--text-secondary)',
        wordBreak: 'break-all',
        flex: 1,
      }}>
        {value}
        <CopyButton text={value} />
      </span>
    </div>
  )
}

function PemOutput({ label, pem }: { label: string; pem: string }) {
  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      background: 'var(--bg-secondary)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 14px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-tertiary)',
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </span>
        <CopyButton text={pem} label="Copy" />
      </div>
      <pre style={{
        fontFamily: 'var(--mono)',
        fontSize: 12,
        color: 'var(--text-primary)',
        padding: '12px 14px',
        margin: 0,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
        maxHeight: 200,
        overflowY: 'auto',
        background: 'var(--bg-code)',
      }}>
        {pem}
      </pre>
    </div>
  )
}
