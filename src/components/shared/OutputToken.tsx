import { useEffect, useState } from 'react'
import { CopyButton } from './CopyButton'

interface OutputTokenProps {
  token: string | null
  error: string | null
  isForging: boolean
}

export function OutputToken({ token, error, isForging }: OutputTokenProps) {
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (token) {
      setFlash(true)
      const t = setTimeout(() => setFlash(false), 600)
      return () => clearTimeout(t)
    }
  }, [token])

  if (isForging) {
    return (
      <div
        style={{
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          background: 'var(--bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <Spinner />
        <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Signing token...
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{
          border: '1px solid var(--danger)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          background: 'var(--danger-bg)',
        }}
      >
        <div style={{
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--danger)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: 6,
        }}>
          Error
        </div>
        <pre style={{
          fontFamily: 'var(--mono)',
          fontSize: 13,
          color: 'var(--danger)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          margin: 0,
        }}>
          {error}
        </pre>
      </div>
    )
  }

  if (!token) return null

  return (
    <div
      style={{
        border: `1px solid ${flash ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        background: 'var(--bg-secondary)',
        transition: 'border-color 300ms, box-shadow 300ms',
        animation: flash ? 'forgeFlash 600ms ease-out' : undefined,
        boxShadow: flash ? '0 0 16px 4px rgba(107, 140, 255, 0.2)' : undefined,
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
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          Forged Token
        </span>
        <CopyButton text={token} label="Copy" />
      </div>

      <div style={{
        padding: '12px 14px',
        fontFamily: 'var(--mono)',
        fontSize: 13,
        color: 'var(--text-primary)',
        wordBreak: 'break-all',
        lineHeight: 1.7,
        whiteSpace: 'pre-wrap',
      }}>
        {/* Color-coded parts */}
        {(() => {
          const parts = token.split('.')
          const colors = ['var(--token-header)', 'var(--token-payload)', 'var(--token-signature)']
          return parts.map((part, i) => (
            <span key={i}>
              <span style={{ color: colors[i] || 'var(--text-primary)' }}>{part}</span>
              {i < parts.length - 1 && <span style={{ color: 'var(--text-muted)' }}>.</span>}
            </span>
          ))
        })()}
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" style={{ animation: 'spin 0.8s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" fill="none" stroke="var(--border)" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
