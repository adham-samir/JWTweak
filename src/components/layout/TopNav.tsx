import { useJWT } from '../../hooks/useJWT'
import type { TabId } from '../../types/jwt.types'

const TABS: { id: TabId; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'decoder', label: 'Decode' },
  { id: 'encoder', label: 'Encode' },
  { id: 'attacks', label: 'Attacks' },
  { id: 'key-tools', label: 'Key Tools' },
]

export function TopNav() {
  const { activeTab, setActiveTab } = useJWT()

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      height: 52,
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-secondary)',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--text-primary)',
            cursor: 'pointer',
            letterSpacing: '-0.5px',
          }}
          onClick={() => setActiveTab('home')}
        >
          JWT<span style={{ color: 'var(--accent)' }}>weak</span>
        </span>

        <div style={{ display: 'flex', gap: 4 }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  background: isActive ? 'var(--bg-tertiary)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontFamily: 'var(--sans)',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--bg-hover)'
                    e.currentTarget.style.color = 'var(--text-primary)'
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <a
        href="https://github.com/adham-samir/JWTweak"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: 'var(--text-secondary)',
          fontSize: 13,
          transition: 'color var(--transition-fast)',
          textDecoration: 'none',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
      >
        GitHub
      </a>
    </nav>
  )
}
