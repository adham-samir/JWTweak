import { motion } from 'framer-motion'
import { useJWT } from '../../hooks/useJWT'

const FEATURES = [
  {
    icon: '{}',
    title: 'Decode',
    desc: 'Live header / payload / signature breakdown with human-readable claim labels, expiry badges, and signature verification.',
    tab: 'decoder' as const,
    color: 'var(--token-header)',
  },
  {
    icon: '⚙',
    title: 'Encode',
    desc: 'Build JWTs from scratch — set any header, any payload, any algorithm. Sign with HMAC, RSA, or ECDSA keys.',
    tab: 'encoder' as const,
    color: 'var(--token-payload)',
  },
  {
    icon: '⚔',
    title: 'Attack',
    desc: 'Algorithm confusion, KID injection, JKU injection, JWK embedding. Generate malicious tokens against misconfigured servers.',
    tab: 'attacks' as const,
    color: 'var(--token-signature)',
  },
]

export function HomePage() {
  const { setActiveTab } = useJWT()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '60px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 48,
      }}
    >
      {/* Hero */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontFamily: 'var(--sans)',
          fontSize: 40,
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-1px',
          margin: '0 0 12px',
          lineHeight: 1.2,
        }}>
          The attacker-minded<br />JWT toolkit
        </h1>
        <p style={{
          fontSize: 17,
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          margin: '0 auto',
          maxWidth: 480,
        }}>
          Forge, audit &amp; break JSON Web Tokens — entirely in your browser.
          No backend. No tracking. WebCrypto only.
        </p>
      </div>

      {/* Trust badges */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 16,
      }}>
        {['No backend', 'No tracking', 'WebCrypto only'].map(badge => (
          <span key={badge} style={{
            padding: '6px 16px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            fontSize: 13,
            color: 'var(--text-muted)',
            fontWeight: 500,
          }}>
            {badge}
          </span>
        ))}
      </div>

      {/* Feature cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 14,
      }}>
        {FEATURES.map((f, i) => (
          <motion.button
            key={f.title}
            onClick={() => setActiveTab(f.tab)}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1, duration: 0.3 }}
            style={{
              padding: '24px 20px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-secondary)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all var(--transition-fast)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--border-hover)'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = 'var(--shadow-md)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <span style={{
              fontSize: 28,
              color: f.color,
            }}>
              {f.icon}
            </span>
            <div>
              <div style={{
                fontSize: 18,
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: 6,
              }}>
                {f.title}
                <span style={{
                  fontSize: 13,
                  marginLeft: 8,
                  opacity: 0,
                  transition: 'opacity 150ms',
                }} className="feature-arrow">
                  →
                </span>
              </div>
              <p style={{
                fontSize: 14,
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                margin: 0,
              }}>
                {f.desc}
              </p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Footer note */}
      <div style={{
        textAlign: 'center',
        fontSize: 13,
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--border)',
        paddingTop: 32,
      }}>
        <p style={{ margin: 0 }}>
          All JWT operations run locally in your browser — tokens, secrets, and keys never leave your machine.
        </p>
        <p style={{ margin: '4px 0 0', opacity: 0.6 }}>
          For authorized security testing only.
        </p>
      </div>
    </motion.div>
  )
}
