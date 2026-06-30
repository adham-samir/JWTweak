import { useCallback } from 'react'
import { useJWTState, useJWTDispatch } from '../context/JWTContext'
import { signJWT, JWTSignError } from '../utils/jwt/sign'
import type { JwtAlgorithm } from '../types/jwt.types'

/**
 * Hook for forging (signing) modified JWT tokens.
 *
 * Takes the current modified header/payload from context,
 * signs them with the given key, and stores the result.
 */
export function useForgedToken() {
  const {
    modifiedHeader,
    modifiedPayload,
    signingAlgorithm,
    forgedToken,
    forgeError,
    isForging,
  } = useJWTState()
  const dispatch = useJWTDispatch()

  const forgeToken = useCallback(async (
    key?: CryptoKey | Uint8Array | null,
    algorithmOverride?: JwtAlgorithm,
  ) => {
    if (!modifiedHeader || !modifiedPayload) {
      dispatch({ type: 'SET_FORGED_TOKEN', token: null, error: 'No header/payload to sign' })
      return
    }

    dispatch({ type: 'SET_FORGING', isForging: true })
    dispatch({ type: 'SET_FORGED_TOKEN', token: null, error: null })

    try {
      const alg = algorithmOverride || signingAlgorithm
      const token = await signJWT(modifiedHeader, modifiedPayload, {
        algorithm: alg,
        key: key ?? null,
      })
      dispatch({ type: 'SET_FORGED_TOKEN', token, error: null })
    } catch (e) {
      const message = e instanceof JWTSignError
        ? e.message
        : (e as Error).message
      dispatch({ type: 'SET_FORGED_TOKEN', token: null, error: message })
    } finally {
      dispatch({ type: 'SET_FORGING', isForging: false })
    }
  }, [modifiedHeader, modifiedPayload, signingAlgorithm, dispatch])

  const setModifiedHeader = useCallback((header: Record<string, unknown>) => {
    dispatch({ type: 'SET_MODIFIED_HEADER', header })
  }, [dispatch])

  const setModifiedPayload = useCallback((payload: Record<string, unknown>) => {
    dispatch({ type: 'SET_MODIFIED_PAYLOAD', payload })
  }, [dispatch])

  const setSigningAlgorithm = useCallback((algorithm: JwtAlgorithm) => {
    dispatch({ type: 'SET_SIGNING_ALGORITHM', algorithm })
  }, [dispatch])

  return {
    modifiedHeader,
    modifiedPayload,
    signingAlgorithm,
    forgedToken,
    forgeError,
    isForging,
    forgeToken,
    setModifiedHeader,
    setModifiedPayload,
    setSigningAlgorithm,
  }
}
