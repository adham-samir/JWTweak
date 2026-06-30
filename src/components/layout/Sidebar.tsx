import { useJWT } from '../../hooks/useJWT'
import type { TabId } from '../../types/jwt.types'

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'decoder', label: 'Decoder', icon: '{}' },
  { id: 'alg-confusion', label: 'Alg Confusion', icon: '⇄' },
  { id: 'kid-injection', label: 'KID Injection', icon: '🔑' },
  { id: 'jku-injection', label: 'JKU Injection', icon: '🌐' },
  { id: 'jwk-embedding', label: 'JWK Embed', icon: '🔐' },
  { id: 'key-tools', label: 'Key Tools', icon: '🛠' },
]

export function Sidebar() {
  const { activeTab, setActiveTab } = useJWT()

  return (
    <nav
      style={{
        width: 180,
        flexShrink: 0,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '12px 0',
        overflowY: 'auto',
      }}
    >
      {TABS.map((tab, i) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: '10px 16px',
              border: 'none',
              background: isActive ? 'var(--bg-tertiary)' : 'transparent',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: 14,
              fontWeight: isActive ? 600 : 400,
              fontFamily: 'var(--sans)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              textAlign: 'left',
              borderLeft: `2px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
              position: 'relative',
              animation: `sidebarSlideIn 250ms ease-out ${i * 30}ms both`,
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
            <span style={{
              fontFamily: 'var(--mono)',
              fontSize: 14,
              width: 24,
              textAlign: 'center',
              opacity: isActive ? 1 : 0.6,
              transition: 'opacity var(--transition-fast)',
            }}>
              {tab.icon}
            </span>
            <span>{tab.label}</span>

            {isActive && (
              <span
                style={{
                  position: 'absolute',
                  right: 10,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  boxShadow: '0 0 8px rgba(107, 140, 255, 0.5)',
                }}
              />
            )}
          </button>
        )
      })}
    </nav>
  )
}
