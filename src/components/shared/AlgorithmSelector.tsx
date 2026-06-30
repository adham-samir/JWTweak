import type { JwtAlgorithm } from '../../types/jwt.types'
import { ALGORITHMS } from '../../constants/algorithms'

interface AlgorithmSelectorProps {
  value: JwtAlgorithm
  onChange: (alg: JwtAlgorithm) => void
  label?: string
  disabled?: boolean
}

export function AlgorithmSelector({ value, onChange, label = 'Algorithm', disabled = false }: AlgorithmSelectorProps) {
  return (
    <div>
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
      <select
        value={value}
        onChange={e => onChange(e.target.value as JwtAlgorithm)}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-code)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--mono)',
          fontSize: 13,
          outline: 'none',
          cursor: 'pointer',
          transition: 'border-color var(--transition-fast)',
        }}
        onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
        onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
      >
        {ALGORITHMS.map(alg => (
          <option key={alg.value} value={alg.value}>
            {alg.label}
          </option>
        ))}
      </select>
    </div>
  )
}
