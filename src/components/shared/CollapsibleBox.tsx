import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CopyButton } from './CopyButton'

interface CollapsibleBoxProps {
  title: string
  content: string
  defaultOpen?: boolean
  downloadFilename?: string
}

export function CollapsibleBox({ title, content, defaultOpen = true, downloadFilename }: CollapsibleBoxProps) {
  const [open, setOpen] = useState(defaultOpen)

  const handleDownload = () => {
    if (!downloadFilename) return
    const blob = new Blob([content], { type: 'application/x-pem-file' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = downloadFilename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      background: 'var(--bg-secondary)',
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '8px 14px',
          border: 'none',
          borderBottom: open ? '1px solid var(--border)' : 'none',
          background: 'var(--bg-tertiary)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontFamily: 'var(--sans)',
          fontSize: 12,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          transition: 'background var(--transition-fast)',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <motion.span
            animate={{ rotate: open ? 90 : 0 }}
            transition={{ duration: 0.15 }}
            style={{ display: 'inline-block', fontSize: 10, color: 'var(--text-muted)' }}
          >
            ▶
          </motion.span>
          {title}
        </span>
        <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
          <CopyButton text={content} />
          {downloadFilename && (
            <button
              onClick={handleDownload}
              title={`Download ${downloadFilename}`}
              style={{
                padding: '2px 8px',
                fontSize: 12,
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontFamily: 'var(--sans)',
                fontWeight: 500,
                transition: 'all var(--transition-fast)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
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
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{ overflow: 'hidden' }}
          >
            <pre style={{
              fontFamily: 'var(--mono)',
              fontSize: 12,
              color: 'var(--text-primary)',
              padding: '12px 14px',
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              maxHeight: 240,
              overflowY: 'auto',
              background: 'var(--bg-code)',
            }}>
              {content}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
