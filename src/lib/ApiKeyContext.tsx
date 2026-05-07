'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface ApiKeyContextType {
  apiKey: string
  setApiKey: (key: string) => void
  clearApiKey: () => void
  hasKey: boolean
}

const ApiKeyContext = createContext<ApiKeyContextType>({
  apiKey: '',
  setApiKey: () => {},
  clearApiKey: () => {},
  hasKey: false,
})

const STORAGE_KEY = 'llm_toolkit_api_key'

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKeyState] = useState('')

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) setApiKeyState(stored)
  }, [])

  const setApiKey = (key: string) => {
    setApiKeyState(key)
    if (key) localStorage.setItem(STORAGE_KEY, key)
    else localStorage.removeItem(STORAGE_KEY)
  }

  const clearApiKey = () => {
    setApiKeyState('')
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <ApiKeyContext.Provider value={{ apiKey, setApiKey, clearApiKey, hasKey: !!apiKey }}>
      {children}
    </ApiKeyContext.Provider>
  )
}

export const useApiKey = () => useContext(ApiKeyContext)
