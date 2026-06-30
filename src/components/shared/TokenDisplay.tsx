import type { DecodedPart } from '../../types/jwt.types'

interface TokenDisplayProps {
  label: string
  color: string
  part: DecodedPart
  showRaw?: boolean
}

export function TokenDisplay({ label, color, part, showRaw = true }: TokenDisplayProps) {
  return (
    <div
      style={{
        border: `1px solid var(--border)`,
        borderLeft: `3px solid ${color}`,
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        background: 'var(--bg-secondary)',
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
          fontSize: 12,
          fontWeight: 600,
          color,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: color,
            display: 'inline-block',
          }} />
          {label}
        </span>
        <span style={{
          fontSize: 11,
          color: 'var(--text-muted)',
          fontFamily: 'var(--mono)',
        }}>
          {Object.keys(part.json).length} fields
        </span>
      </div>

      {showRaw && (
        <div style={{
          padding: '8px 14px',
          fontFamily: 'var(--mono)',
          fontSize: 12,
          color: 'var(--text-secondary)',
          wordBreak: 'break-all',
          background: 'var(--bg-code)',
          lineHeight: 1.6,
          borderBottom: '1px solid var(--border)',
        }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{'raw> '}</span>
          {part.raw}
        </div>
      )}

      <div style={{
        padding: '10px 14px',
        fontFamily: 'var(--mono)',
        fontSize: 13,
        color: 'var(--text-primary)',
        lineHeight: 1.7,
        whiteSpace: 'pre-wrap',
      }}>
        {JSON.stringify(part.json, null, 2)}
      </div>
    </div>
  )
}
