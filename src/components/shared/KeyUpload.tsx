import { useState, useCallback } from 'react'

interface KeyUploadProps {
  label?: string
  onKeyLoaded: (pem: string) => void
}

export function KeyUpload({ label = 'Upload Public Key', onKeyLoaded }: KeyUploadProps) {
  const [pem, setPem] = useState('')
  const [mode, setMode] = useState<'file' | 'paste'>('file')
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => {
      const content = reader.result as string
      setPem(content)
      onKeyLoaded(content)
    }
    reader.readAsText(file)
  }, [onKeyLoaded])

  const handlePasteChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setPem(val)
    if (val.trim()) {
      onKeyLoaded(val)
    }
  }, [onKeyLoaded])

  return (
    <div>
      {label && (
        <div style={{
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: 6,
        }}>
          {label}
        </div>
      )}

      <div style={{ display: 'flex', gap: 0, marginBottom: 8 }}>
        <button
          onClick={() => setMode('file')}
          style={{
            padding: '5px 12px',
            fontSize: 13,
            border: `1px solid ${mode === 'file' ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)',
            background: mode === 'file' ? 'var(--accent-bg)' : 'var(--bg-tertiary)',
            color: mode === 'file' ? 'var(--accent)' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontFamily: 'var(--sans)',
            fontWeight: 500,
          }}
        >
          📂 File
        </button>
        <button
          onClick={() => setMode('paste')}
          style={{
            padding: '5px 12px',
            fontSize: 13,
            border: `1px solid ${mode === 'paste' ? 'var(--accent)' : 'var(--border)'}`,
            borderLeft: 'none',
            borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
            background: mode === 'paste' ? 'var(--accent-bg)' : 'var(--bg-tertiary)',
            color: mode === 'paste' ? 'var(--accent)' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontFamily: 'var(--sans)',
            fontWeight: 500,
          }}
        >
          ✏️ Paste
        </button>
      </div>

      {mode === 'file' ? (
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '20px',
            border: '1px dashed var(--border)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            fontSize: 14,
            transition: 'all var(--transition-fast)',
            background: 'var(--bg-code)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--border-hover)'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.color = 'var(--text-muted)'
          }}
        >
          <input
            type="file"
            accept=".pem,.key,.pub,.txt"
            onChange={handleFile}
            style={{ display: 'none' }}
          />
          {fileName ? (
            <span style={{ color: 'var(--success)', fontFamily: 'var(--mono)' }}>
              ✅ {fileName}
            </span>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Click to upload PEM file
            </>
          )}
        </label>
      ) : (
        <textarea
          value={pem}
          onChange={handlePasteChange}
          placeholder="-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...
-----END PUBLIC KEY-----"
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
            lineHeight: 1.6,
            resize: 'vertical',
            outline: 'none',
            transition: 'border-color var(--transition-fast)',
          }}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
        />
      )}
    </div>
  )
}
