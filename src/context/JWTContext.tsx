import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react'
import type { TabId, DecodedJWT, JwtAlgorithm } from '../types/jwt.types'
import type { KeyPairWithMeta } from '../types/crypto.types'

// ─── State ─────────────────────────────────────────────────────

export interface JWTState {
  activeTab: TabId
  rawToken: string
  decoded: DecodedJWT | null
  decodeError: string | null

  modifiedHeader: Record<string, unknown> | null
  modifiedPayload: Record<string, unknown> | null
  signingAlgorithm: JwtAlgorithm

  forgedToken: string | null
  forgeError: string | null
  isForging: boolean

  loadedKeys: KeyPairWithMeta[]
  activeKeyId: string | null
}

const initialState: JWTState = {
  activeTab: 'decoder',
  rawToken: '',
  decoded: null,
  decodeError: null,

  modifiedHeader: null,
  modifiedPayload: null,
  signingAlgorithm: 'HS256',

  forgedToken: null,
  forgeError: null,
  isForging: false,

  loadedKeys: [],
  activeKeyId: null,
}

// ─── Actions ───────────────────────────────────────────────────

export type JWTAction =
  | { type: 'SET_ACTIVE_TAB'; tab: TabId }
  | { type: 'SET_TOKEN'; token: string }
  | { type: 'SET_DECODED'; decoded: DecodedJWT | null; error: string | null }
  | { type: 'CLEAR_TOKEN' }
  | { type: 'SET_MODIFIED_HEADER'; header: Record<string, unknown> }
  | { type: 'SET_MODIFIED_PAYLOAD'; payload: Record<string, unknown> }
  | { type: 'SET_SIGNING_ALGORITHM'; algorithm: JwtAlgorithm }
  | { type: 'SET_FORGED_TOKEN'; token: string | null; error: string | null }
  | { type: 'SET_FORGING'; isForging: boolean }
  | { type: 'ADD_KEY'; key: KeyPairWithMeta }
  | { type: 'REMOVE_KEY'; id: string }
  | { type: 'SET_ACTIVE_KEY'; id: string | null }

// ─── Reducer ───────────────────────────────────────────────────

function jwtReducer(state: JWTState, action: JWTAction): JWTState {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.tab, forgeError: null }

    case 'SET_TOKEN':
      return {
        ...state,
        rawToken: action.token,
        decoded: null,
        decodeError: null,
        modifiedHeader: null,
        modifiedPayload: null,
        forgedToken: null,
        forgeError: null,
      }

    case 'SET_DECODED':
      return {
        ...state,
        decoded: action.decoded,
        decodeError: action.error,
        // Pre-fill modified header/payload from decoded token
        modifiedHeader: action.decoded ? { ...action.decoded.header.json } : null,
        modifiedPayload: action.decoded ? { ...action.decoded.payload.json } : null,
        signingAlgorithm: (action.decoded?.header.json?.alg as JwtAlgorithm) || 'HS256',
        forgedToken: null,
        forgeError: null,
      }

    case 'CLEAR_TOKEN':
      return {
        ...state,
        rawToken: '',
        decoded: null,
        decodeError: null,
        modifiedHeader: null,
        modifiedPayload: null,
        forgedToken: null,
        forgeError: null,
      }

    case 'SET_MODIFIED_HEADER':
      return { ...state, modifiedHeader: action.header }

    case 'SET_MODIFIED_PAYLOAD':
      return { ...state, modifiedPayload: action.payload }

    case 'SET_SIGNING_ALGORITHM':
      return { ...state, signingAlgorithm: action.algorithm }

    case 'SET_FORGED_TOKEN':
      return { ...state, forgedToken: action.token, forgeError: action.error }

    case 'SET_FORGING':
      return { ...state, isForging: action.isForging }

    case 'ADD_KEY':
      return {
        ...state,
        loadedKeys: [...state.loadedKeys, action.key],
        activeKeyId: action.key.id,
      }

    case 'REMOVE_KEY':
      return {
        ...state,
        loadedKeys: state.loadedKeys.filter(k => k.id !== action.id),
        activeKeyId: state.activeKeyId === action.id ? null : state.activeKeyId,
      }

    case 'SET_ACTIVE_KEY':
      return { ...state, activeKeyId: action.id }

    default:
      return state
  }
}

// ─── Context ───────────────────────────────────────────────────

const JWTStateContext = createContext<JWTState | null>(null)
const JWTDispatchContext = createContext<Dispatch<JWTAction> | null>(null)

export function JWTProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(jwtReducer, initialState)

  return (
    <JWTStateContext.Provider value={state}>
      <JWTDispatchContext.Provider value={dispatch}>
        {children}
      </JWTDispatchContext.Provider>
    </JWTStateContext.Provider>
  )
}

export function useJWTState(): JWTState {
  const ctx = useContext(JWTStateContext)
  if (!ctx) throw new Error('useJWTState must be used within JWTProvider')
  return ctx
}

export function useJWTDispatch(): Dispatch<JWTAction> {
  const ctx = useContext(JWTDispatchContext)
  if (!ctx) throw new Error('useJWTDispatch must be used within JWTProvider')
  return ctx
}
