import { useCallback } from 'react'
import { useJWTState, useJWTDispatch } from '../context/JWTContext'
import { decodeJWT, JWTDecodeError } from '../utils/jwt/decode'

/**
 * High-level hook for JWT token management.
 *
 * Handles token decode with error handling and dispatches
 * the decoded result or error to the shared context.
 */
export function useJWT() {
  const { rawToken, decoded, decodeError, activeTab } = useJWTState()
  const dispatch = useJWTDispatch()

  const setToken = useCallback((token: string) => {
    dispatch({ type: 'SET_TOKEN', token })

    if (!token.trim()) {
      dispatch({ type: 'SET_DECODED', decoded: null, error: null })
      return
    }

    try {
      const result = decodeJWT(token)
      dispatch({ type: 'SET_DECODED', decoded: result, error: null })
    } catch (e) {
      if (e instanceof JWTDecodeError) {
        dispatch({ type: 'SET_DECODED', decoded: null, error: e.message })
      } else {
        dispatch({ type: 'SET_DECODED', decoded: null, error: (e as Error).message })
      }
    }
  }, [dispatch])

  const clearToken = useCallback(() => {
    dispatch({ type: 'CLEAR_TOKEN' })
  }, [dispatch])

  const setActiveTab = useCallback((tab: typeof activeTab) => {
    dispatch({ type: 'SET_ACTIVE_TAB', tab })
  }, [dispatch])

  return {
    rawToken,
    decoded,
    decodeError,
    activeTab,
    setToken,
    clearToken,
    setActiveTab,
  }
}
