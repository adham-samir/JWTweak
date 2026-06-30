import { useState, useEffect, useCallback } from 'react'

interface JsonEditorProps {
  value: Record<string, unknown>
  onChange: (value: Record<string, unknown>) => void
  label?: string
  readOnly?: boolean
}

export function JsonEditor({ value, onChange, label, readOnly = false }: JsonEditorProps) {
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Sync external value → text
  useEffect(() => {
    try {
      setText(JSON.stringify(value, null, 2))
      setError(null)
    } catch {
      setText('{}')
    }
  }, [value])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setText(newText)

    try {
      const parsed = JSON.parse(newText)
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        setError('Must be a JSON object')
        return
      }
      setError(null)
      onChange(parsed as Record<string, unknown>)
    } catch (err) {
      setError((err as Error).message)
    }
  }, [onChange])

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
      <textarea
        value={text}
        onChange={handleChange}
        readOnly={readOnly}
        spellCheck={false}
        style={{
          width: '100%',
          minHeight: 120,
          maxHeight: 300,
          padding: '10px 12px',
          border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-code)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--mono)',
          fontSize: 13,
          lineHeight: 1.6,
          resize: 'vertical',
          outline: 'none',
          transition: 'border-color var(--transition-fast)',
          tabSize: 2,
        }}
        onFocus={e => {
          e.currentTarget.style.borderColor = error ? 'var(--danger)' : 'var(--accent)'
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = error ? 'var(--danger)' : 'var(--border)'
        }}
      />
      {error && (
        <div style={{
          fontSize: 12,
          color: 'var(--danger)',
          marginTop: 4,
          fontFamily: 'var(--mono)',
        }}>
          ⚠ {error}
        </div>
      )}
    </div>
  )
}
