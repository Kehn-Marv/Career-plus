import { useState, useCallback, useEffect } from 'react'
import {
  generateEmbedding,
  getModelInfo,
  preloadModel
} from '@/lib/ai'

export interface UseEmbeddingsResult {
  generate: (text: string) => Promise<number[]>
  isGenerating: boolean
  isModelReady: boolean
  isModelLoading: boolean
  error: string | null
  modelInfo: {
    name: string
    initialized: boolean
    isInitializing: boolean
  }
  preload: () => Promise<void>
}

/**
 * Custom hook for generating embeddings
 */
export function useEmbeddings(): UseEmbeddingsResult {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isModelLoading, setIsModelLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modelInfo, setModelInfo] = useState(getModelInfo())

  // Update model info periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setModelInfo(getModelInfo())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const generate = useCallback(async (text: string): Promise<number[]> => {
    setIsGenerating(true)
    setError(null)

    try {
      const embedding = await generateEmbedding(text)
      setIsGenerating(false)
      return embedding
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to generate embedding'
      setError(errorMessage)
      setIsGenerating(false)
      throw new Error(errorMessage)
    }
  }, [])

  const preload = useCallback(async (): Promise<void> => {
    setIsModelLoading(true)
    setError(null)

    try {
      await preloadModel()
      setModelInfo(getModelInfo())
      setIsModelLoading(false)
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to preload model'
      setError(errorMessage)
      setIsModelLoading(false)
      throw new Error(errorMessage)
    }
  }, [])

  return {
    generate,
    isGenerating,
    isModelReady: modelInfo.initialized,
    isModelLoading: isModelLoading || modelInfo.isInitializing,
    error,
    modelInfo,
    preload
  }
}
