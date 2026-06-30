import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlgConfusionPanel } from './alg-confusion/AlgConfusionPanel'
import { KidInjectionPanel } from './kid-injection/KidInjectionPanel'
import { JkuInjectionPanel } from './jku-injection/JkuInjectionPanel'
import { JwkEmbeddingPanel } from './jwk-embedding/JwkEmbeddingPanel'
import type { AttackSubTab } from '../../types/jwt.types'

const ATTACK_TABS: { id: AttackSubTab; label: string; desc: string }[] = [
  { id: 'alg-confusion', label: 'Alg Confusion', desc: 'RS256→HS256 downgrade using the target\'s public key as HMAC secret' },
  { id: 'kid-injection', label: 'KID Injection', desc: 'SQLi / path traversal / command injection in the kid header' },
  { id: 'jku-injection', label: 'JKU Injection', desc: 'Host attacker JWKS, point jku header at it' },
  { id: 'jwk-embedding', label: 'JWK Embedding', desc: 'Embed attacker public key directly in jwk header' },
]

export function AttacksPage() {
  const [subTab, setSubTab] = useState<AttackSubTab>('alg-confusion')

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ maxWidth: 960, margin: '0 auto', padding: '28px 24px' }}
    >
      <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px' }}>Attacks</h2>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 20px' }}>
        Paste a JWT in the Decode tab first — then switch here to generate malicious variants.
      </p>

      {/* Sub-tab bar */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid var(--border)' }}>
        {ATTACK_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            style={{
              padding: '10px 16px',
              fontSize: 13,
              fontWeight: subTab === tab.id ? 600 : 400,
              border: 'none',
              borderBottom: `2px solid ${subTab === tab.id ? 'var(--accent)' : 'transparent'}`,
              background: 'transparent',
              color: subTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontFamily: 'var(--sans)',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={e => {
              if (subTab !== tab.id) e.currentTarget.style.color = 'var(--text-primary)'
            }}
            onMouseLeave={e => {
              if (subTab !== tab.id) e.currentTarget.style.color = 'var(--text-secondary)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={subTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
        >
          {subTab === 'alg-confusion' && <AlgConfusionPanel />}
          {subTab === 'kid-injection' && <KidInjectionPanel />}
          {subTab === 'jku-injection' && <JkuInjectionPanel />}
          {subTab === 'jwk-embedding' && <JwkEmbeddingPanel />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
