import { JWTProvider, useJWTState } from './context/JWTContext'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { DecoderPanel } from './components/decoder/DecoderPanel'
import { AlgConfusionPanel } from './components/attacks/alg-confusion/AlgConfusionPanel'
import { KidInjectionPanel } from './components/attacks/kid-injection/KidInjectionPanel'
import { JkuInjectionPanel } from './components/attacks/jku-injection/JkuInjectionPanel'
import { JwkEmbeddingPanel } from './components/attacks/jwk-embedding/JwkEmbeddingPanel'
import { KeyToolsPanel } from './components/attacks/key-tools/KeyToolsPanel'
import { motion, AnimatePresence } from 'framer-motion'

function AppContent() {
  const { activeTab } = useJWTState()

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
      <Sidebar />

      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {/* Decoder is always visible at top of content area */}
        <DecoderPanel />

        {/* Active attack panel below the decoder */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            {activeTab === 'alg-confusion' && <AlgConfusionPanel />}
            {activeTab === 'kid-injection' && <KidInjectionPanel />}
            {activeTab === 'jku-injection' && <JkuInjectionPanel />}
            {activeTab === 'jwk-embedding' && <JwkEmbeddingPanel />}
            {activeTab === 'key-tools' && <KeyToolsPanel />}
            {/* decoder tab shows nothing extra — the DecoderPanel is already visible */}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <JWTProvider>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <Header />
        <AppContent />
      </div>

      <style>{`
        @keyframes sidebarSlideIn {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
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
