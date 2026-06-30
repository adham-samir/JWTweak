import { motion } from 'framer-motion'
import { analyzeClaims } from '../../utils/claims'

interface ClaimLabelsProps {
  payload: Record<string, unknown>
}

const STATUS_COLORS: Record<string, string> = {
  ok: 'var(--success)',
  warning: 'var(--warning)',
  error: 'var(--danger)',
  info: 'var(--text-secondary)',
}

const STATUS_BG: Record<string, string> = {
  ok: 'var(--success-bg)',
  warning: 'var(--warning-bg)',
  error: 'var(--danger-bg)',
  info: 'transparent',
}

export function ClaimLabels({ payload }: ClaimLabelsProps) {
  const claims = analyzeClaims(payload)
  const interesting = claims.filter(c => c.status === 'error' || c.status === 'warning')

  if (interesting.length === 0) return null

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {interesting.map(claim => {
        const isExpired = claim.status === 'error' && claim.key === 'exp'
        return (
          <motion.span
            key={claim.key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: 1,
              scale: 1,
              ...(isExpired ? { opacity: [1, 0.5, 1] } : {}),
            }}
            transition={
              isExpired
                ? { opacity: { repeat: Infinity, duration: 2 } }
                : { duration: 0.2 }
            }
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 12,
              fontWeight: 500,
              color: STATUS_COLORS[claim.status || 'info'],
              background: STATUS_BG[claim.status || 'info'],
              border: `1px solid ${STATUS_COLORS[claim.status || 'info']}20`,
            }}
          >
            {claim.status === 'error' && '⚠ '}
            {claim.status === 'warning' && '⚡ '}
            {claim.message || claim.label || claim.key}
          </motion.span>
        )}
      )}
    </div>
  )
}
