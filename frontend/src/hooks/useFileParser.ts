import { useState, useCallback } from 'react'
import { extractText, cleanText, type ExtractedText } from '@/lib/parsers'
import { validateContent } from '@/lib/validators/content-validator'

export interface UseFileParserResult {
  parse: (file: File, type: 'resume' | 'job-description') => Promise<ExtractedText>
  isParsing: boolean
  error: string | null
  progress: number
}

/**
 * Custom hook for parsing files with progress tracking
 */
export function useFileParser(): UseFileParserResult {
  const [isParsing, setIsParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const parse = useCallback(async (
    file: File,
    type: 'resume' | 'job-description'
  ): Promise<ExtractedText> => {
    setIsParsing(true)
    setError(null)
    setProgress(0)

    try {
      // Step 1: Extract text (0-60%)
      setProgress(10)
      const extracted = await extractText(file)
      setProgress(60)

      // Step 2: Clean text (60-70%)
      const cleanedText = cleanText(extracted.text)
      extracted.text = cleanedText
      setProgress(70)

      // Step 3: Validate content (70-90%)
      const validation = await validateContent(
        cleanedText,
        file.size,
        type
      )
      setProgress(90)

      if (!validation.valid) {
        throw new Error(validation.error || 'Content validation failed')
      }

      // Add validation warnings if any
      if (validation.confidence && validation.confidence < 0.8) {
        extracted.warnings.push(
          `Content validation confidence: ${Math.round(validation.confidence * 100)}%`
        )
      }

      setProgress(100)
      setIsParsing(false)

      return extracted

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to parse file'
      setError(errorMessage)
      setIsParsing(false)
      setProgress(0)
      throw new Error(errorMessage)
    }
  }, [])

  return {
    parse,
    isParsing,
    error,
    progress
  }
}
