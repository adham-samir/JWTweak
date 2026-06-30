import { useCallback } from 'react'
import { useJWTState, useJWTDispatch } from '../context/JWTContext'
import {
  generateRSAKeypair,
  exportPublicKeyPEM,
  exportPrivateKeyPEM,
  exportKeyJWK,
  importPublicKeyPEM,
  importPrivateKeyPEM,
  rsaImportParams,
} from '../utils/crypto/keygen'
import { buildJWKS } from '../utils/crypto/jwk-utils'
import type { KeyPairWithMeta, RsaGenOptions } from '../types/crypto.types'

let keyCounter = 0

export function useKeyManager() {
  const { loadedKeys, activeKeyId } = useJWTState()
  const dispatch = useJWTDispatch()

  const activeKey = loadedKeys.find(k => k.id === activeKeyId) ?? null

  const generateRSA = useCallback(async (options: RsaGenOptions = { modulusLength: 2048, hash: 'SHA-256' }) => {
    const keypair = await generateRSAKeypair(options)
    const id = `rsa-${++keyCounter}-${Date.now()}`

    const publicKeyJwk = await exportKeyJWK(keypair.publicKey)
    const publicKeyPem = await exportPublicKeyPEM(keypair.publicKey)
    const privateKeyPem = await exportPrivateKeyPEM(keypair.privateKey)
    const jwks = buildJWKS([publicKeyJwk])

    const alg = options.modulusLength === 4096
      ? (options.hash === 'SHA-384' ? 'RS384' as const : 'RS512' as const)
      : 'RS256' as const

    const meta: KeyPairWithMeta = {
      id,
      label: `RSA-${options.modulusLength} (${options.hash})`,
      publicKey: keypair.publicKey,
      privateKey: keypair.privateKey,
      algorithm: alg,
      publicKeyJwk,
      publicKeyPem,
      privateKeyPem,
      jwks,
      createdAt: Date.now(),
    }

    dispatch({ type: 'ADD_KEY', key: meta })
    return meta
  }, [dispatch])

  const importPublicPEM = useCallback(async (pem: string, label?: string) => {
    const id = `imported-pub-${++keyCounter}-${Date.now()}`
    const publicKey = await importPublicKeyPEM(pem, rsaImportParams('SHA-256'))
    const publicKeyJwk = await exportKeyJWK(publicKey)
    const jwks = buildJWKS([publicKeyJwk])

    const meta: KeyPairWithMeta = {
      id,
      label: label || 'Imported Public Key',
      publicKey,
      privateKey: null as unknown as CryptoKey, // no private key
      algorithm: 'RS256',
      publicKeyJwk,
      publicKeyPem: pem,
      jwks,
      createdAt: Date.now(),
    }

    dispatch({ type: 'ADD_KEY', key: meta })
    return meta
  }, [dispatch])

  const importPrivatePEM = useCallback(async (pem: string, label?: string) => {
    const id = `imported-priv-${++keyCounter}-${Date.now()}`
    const privateKey = await importPrivateKeyPEM(pem, rsaImportParams('SHA-256'))
    const publicKeyJwk = await exportKeyJWK(privateKey)
    const privateKeyPem = pem

    const meta: KeyPairWithMeta = {
      id,
      label: label || 'Imported Private Key',
      publicKey: null as unknown as CryptoKey,
      privateKey,
      algorithm: 'RS256',
      publicKeyJwk,
      privateKeyPem,
      createdAt: Date.now(),
    }

    dispatch({ type: 'ADD_KEY', key: meta })
    return meta
  }, [dispatch])

  const removeKey = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_KEY', id })
  }, [dispatch])

  const setActiveKey = useCallback((id: string | null) => {
    dispatch({ type: 'SET_ACTIVE_KEY', id })
  }, [dispatch])

  return {
    loadedKeys,
    activeKey,
    activeKeyId,
    generateRSA,
    importPublicPEM,
    importPrivatePEM,
    removeKey,
    setActiveKey,
  }
}
