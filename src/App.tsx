import { JWTProvider, useJWTState } from './context/JWTContext'
import { TopNav } from './components/layout/TopNav'
import { HomePage } from './components/home/HomePage'
import { DecoderPanel } from './components/decoder/DecoderPanel'
import { EncoderPanel } from './components/encoder/EncoderPanel'
import { AttacksPage } from './components/attacks/AttacksPage'
import { KeyToolsPanel } from './components/attacks/key-tools/KeyToolsPanel'
import { Analytics } from '@vercel/analytics/react'
import { AnimatePresence, motion } from 'framer-motion'

function AppContent() {
  const { activeTab } = useJWTState()

  return (
    <div style={{
      flex: 1,
      minHeight: 0,
      overflowY: 'auto',
      background: 'var(--bg-primary)',
    }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          {activeTab === 'home' && <HomePage />}
          {activeTab === 'decoder' && <DecoderPanel />}
          {activeTab === 'encoder' && <EncoderPanel />}
          {activeTab === 'attacks' && <AttacksPage />}
          {activeTab === 'key-tools' && <KeyToolsPanel />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default function App() {
  return (
    <JWTProvider>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}>
        <TopNav />
        <AppContent />
      </div>
      <Analytics />

      <style>{`
        @keyframes forgeFlash {
          0%   { border-color: var(--accent); box-shadow: 0 0 0 0 rgba(107, 140, 255, 0.4); }
          70%  { border-color: var(--accent); box-shadow: 0 0 16px 4px rgba(107, 140, 255, 0.2); }
          100% { border-color: var(--border); box-shadow: none; }
        }
        @keyframes pulseWarning {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.5; }
        }
      `}</style>
    </JWTProvider>
  )
}
