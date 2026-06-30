import { useState, useCallback } from 'react'

interface CopyButtonProps {
  text: string
  label?: string
  size?: 'sm' | 'md'
}

export function CopyButton({ text, label = 'Copy', size = 'sm' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Fallback for older browsers
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }, [text])

  const btnStyle = size === 'sm'
    ? { padding: '2px 8px', fontSize: 12 }
    : { padding: '6px 14px', fontSize: 13 }

  return (
    <button
      onClick={handleCopy}
      style={{
        ...btnStyle,
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        background: copied ? 'var(--success-bg)' : 'var(--bg-tertiary)',
        color: copied ? 'var(--success)' : 'var(--text-secondary)',
        cursor: 'pointer',
        fontFamily: 'var(--sans)',
        fontWeight: 500,
        transition: 'all var(--transition-fast)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => {
        if (!copied) {
          e.currentTarget.style.borderColor = 'var(--border-hover)'
          e.currentTarget.style.color = 'var(--text-primary)'
        }
      }}
      onMouseLeave={e => {
        if (!copied) {
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.color = 'var(--text-secondary)'
        }
      }}
    >
      {copied ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {label}
        </>
      )}
    </button>
  )
}
